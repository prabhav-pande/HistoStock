#REMOVING DATA FROM STOCK DATASET
# import pandas as pd
# import os

# print("Current working directory:", os.getcwd())

# # Read the company CSV file
# company_df = pd.read_csv('temp.csv')

# # Read the stock data CSV file
# stock_df = pd.read_csv('all_stocks_5yr.csv')

# # Get a list of distinct tickers that are common between the two files
# common_tickers = company_df['Ticker'].unique()

# # Filter the stock data to only include rows with matching tickers
# filtered_stock_df = stock_df[stock_df['Name'].isin(common_tickers)]

# # Print the count and list of distinct common tickers
# print("Number of distinct common tickers:", len(common_tickers))

# # Print the number of distinct values and rows in the filtered dataset
# num_distinct_values = len(filtered_stock_df['Name'].unique())
# num_rows = len(filtered_stock_df)
# print("Number of distinct values in filtered dataset:", num_distinct_values)
# print("Number of rows in filtered dataset:", num_rows)

# # Save the filtered stock data to a new CSV file
# filtered_stock_df.to_csv('filtered_stock_data.csv', index=False)

# print("Filtered stock data saved to filtered_stock_data.csv")


#REMOVING DATA FROM COMPANY DATASET
import pandas as pd
import os

print("Current working directory:", os.getcwd())

# Read the company CSV file
company_df = pd.read_csv('temp.csv')

# Read the stock data CSV file
stock_df = pd.read_csv('all_stocks_5yr.csv')

# Get a list of distinct tickers that are common between the two files
common_tickers = stock_df['Name'].unique()

# Filter the temp dataset to only include rows with matching tickers
filtered_temp_df = company_df[company_df['Ticker'].isin(common_tickers)]

# Print the count and list of distinct common tickers
print("Number of distinct common tickers:", len(common_tickers))

# Print the number of distinct values and rows in the filtered temp dataset
num_distinct_values = len(filtered_temp_df['Ticker'].unique())
num_rows = len(filtered_temp_df)
print("Number of distinct values in filtered temp dataset:", num_distinct_values)
print("Number of rows in filtered temp dataset:", num_rows)

# Save the filtered temp data to a new CSV file
filtered_temp_df.to_csv('filtered_temp.csv', index=False)

print("Filtered temp data saved to filtered_temp.csv")
