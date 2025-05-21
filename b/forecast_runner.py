import sys
import json
import pandas as pd
import numpy as np
from prophet import Prophet
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sqlalchemy import create_engine

# PostgreSQL connection
engine = create_engine('postgresql://postgres:0@localhost:5432/eo_datacenter')


def compare_models_forecast(vm_name: str, forecast_days: int = 90, test_days: int = 30):
    try:
        query = f"""
        SELECT "Date", "In_Use_MiB"
        FROM info
        WHERE "VM" = '{vm_name}'
          AND "In_Use_MiB" IS NOT NULL
          AND "Date" BETWEEN '2024-08-22' AND '2025-02-21'
        ORDER BY "Date"
        """
        df = pd.read_sql(query, engine)

        if df.empty or len(df) < test_days + 60:
            raise ValueError(f"Not enough data for VM: {vm_name}")

        df['Date'] = pd.to_datetime(df['Date'])
        df = df.groupby('Date')['In_Use_MiB'].mean().reset_index()
        df = df.set_index('Date').asfreq('D').interpolate()

        train = df.iloc[:-test_days]
        test = df.iloc[-test_days:]

        results = {}

        # Prophet
        prophet_df = train.reset_index().rename(columns={'Date': 'ds', 'In_Use_MiB': 'y'})
        model_p = Prophet(weekly_seasonality=True, daily_seasonality=False)
        model_p.fit(prophet_df)
        future = model_p.make_future_dataframe(periods=forecast_days)
        forecast_p = model_p.predict(future).set_index('ds')
        pred_p = forecast_p.loc[test.index]['yhat']
        results['Prophet'] = {
            'rmse': np.sqrt(mean_squared_error(test, pred_p)),
            'mae': mean_absolute_error(test, pred_p),
            'forecast': forecast_p[['yhat']]
        }

        # SARIMA
        model_s = SARIMAX(train, order=(1, 1, 1), seasonal_order=(1, 1, 1, 7), enforce_stationarity=False)
        result_s = model_s.fit(disp=False)
        forecast_s = result_s.get_forecast(steps=forecast_days)
        pred_s = result_s.get_forecast(steps=test_days).predicted_mean
        results['SARIMA'] = {
            'rmse': np.sqrt(mean_squared_error(test, pred_s)),
            'mae': mean_absolute_error(test, pred_s),
            'forecast': forecast_s.predicted_mean.to_frame(name='yhat')
        }

        # Seasonal Naive
        seasonal_naive = train[-(7 + test_days):-7].values
        results['Seasonal Naive'] = {
            'rmse': np.sqrt(mean_squared_error(test, seasonal_naive)),
            'mae': mean_absolute_error(test, seasonal_naive),
            'forecast': pd.DataFrame({
                'yhat': [train.iloc[-7:].mean().values[0]] * forecast_days
            }, index=pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=forecast_days))
        }

        # Select best model by RMSE
        best_model = min(results.items(), key=lambda x: x[1]['rmse'])[0]
        best_forecast = results[best_model]['forecast']

        # Provisioned MiB Lookup
        prov_query = f"""
        SELECT "Provisioned_MiB"
        FROM info
        WHERE "VM" = '{vm_name}' AND "Provisioned_MiB" IS NOT NULL
        ORDER BY "Date" DESC
        LIMIT 1
        """
        prov_df = pd.read_sql(prov_query, engine)

        provisioned_mib = None
        cut_date = None
        estimated_days_to_cut = None
        status = "unknown"

        if not prov_df.empty:
            provisioned_mib = float(prov_df.iloc[0, 0])
            overuse = best_forecast[best_forecast['yhat'] > provisioned_mib]

            if not overuse.empty:
                cut_date = str(overuse.index[0].date())
                status = "risk"
            else:
                # Linear extrapolation method
                forecast_growth = best_forecast['yhat'].iloc[-1] - best_forecast['yhat'].iloc[0]
                daily_growth = forecast_growth / forecast_days

                if daily_growth > 0:
                    remaining_margin = provisioned_mib - best_forecast['yhat'].iloc[-1]
                    estimated_days_to_cut = int(np.ceil(remaining_margin / daily_growth))

                    if estimated_days_to_cut <= forecast_days:
                        status = "risk"
                        cut_date = str((best_forecast.index[-1] + pd.Timedelta(days=estimated_days_to_cut)).date())
                    else:
                        status = "safe"
                        cut_date = None

        # Final JSON Output
        forecast_df = best_forecast.reset_index()
        forecast_df.columns = ['date', 'yhat']
        forecast_df['date'] = forecast_df['date'].astype(str)
        forecast_json = forecast_df.tail(forecast_days).to_dict(orient='records')

        return {
            "vm": str(vm_name),
            "best_model": str(best_model),
            "rmse": float(round(results[best_model]['rmse'], 2)),
            "mae": float(round(results[best_model]['mae'], 2)),
            "provisioned_mib": provisioned_mib,
            "cut_date": cut_date,
            "status": status,
            "estimated_days_to_cut": int(estimated_days_to_cut) if estimated_days_to_cut is not None else None,
            "forecast": forecast_json
        }

    except Exception as e:
        return {"vm": vm_name, "error": str(e)}


# CLI execution
if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] != "--all":
        vm_name = sys.argv[1]
        result = compare_models_forecast(vm_name)
        print(json.dumps(result, indent=2))
    else:
        try:
            vm_df = pd.read_sql('SELECT DISTINCT "VM" FROM info WHERE "In_Use_MiB" IS NOT NULL', engine)
            all_results = []
            for vm in vm_df["VM"].dropna().unique():
                print(f"🔍 Forecasting: {vm}")
                res = compare_models_forecast(vm)
                all_results.append(res)
            with open("forecast_results.json", "w", encoding="utf-8") as f:
                json.dump(all_results, f, indent=2)
            print("✅ Forecasts saved to forecast_results.json")
        except Exception as e:
            print(json.dumps({"error": str(e)}))
