import argparse
import json
import os
import shutil
import pandas as pd
import numpy as np
import csv

RAW_TSV = './Abwasser/amelag_einzelstandorte.tsv'

def extract_plot_data(parsed_data, index):
    # Extract data points from the plot (specified by index)
    data_point = parsed_data["x"]["data"][index]
    date_values = data_point["x"]
    map_values = data_point["key"]
    virus_loads = data_point["y"]
    return date_values, map_values, virus_loads

def combine_csv_files(folder_path, output_file):
    # DataFrame für die kombinierten Daten initialisieren
    first_file = os.listdir(folder_path)[0]
    first_file_path = os.path.join(folder_path, first_file)
    first_data = pd.read_csv(first_file_path)
    combined_data = first_data[['date', 'virusload_avg', 'virusload']].copy()
    combined_data.rename(columns={'virusload_avg': f'virusload_avg_{os.path.splitext(first_file)[0]}',
                                  'virusload': f'virusload_{os.path.splitext(first_file)[0]}'}, inplace=True)

    # Durch alle weiteren CSV-Dateien im Ordner iterieren und die Daten hinzufügen
    for filename in os.listdir(folder_path):
        if filename.endswith('.csv') and filename != first_file:
            filepath = os.path.join(folder_path, filename)
            data = pd.read_csv(filepath)

            # Daten zur kombinierten Liste hinzufügen, indem sie nach Datum gematcht werden
            data.rename(columns={'virusload_avg': f'virusload_avg_{os.path.splitext(filename)[0]}',
                                 'virusload': f'virusload_{os.path.splitext(filename)[0]}'}, inplace=True)
            combined_data = pd.merge(combined_data, data[['date', f'virusload_avg_{os.path.splitext(filename)[0]}', f'virusload_{os.path.splitext(filename)[0]}']], on='date', how='outer')

    # Daten nach Datum sortieren
    combined_data.sort_values(by=['date'], inplace=True)
    # Ergebnisse in eine neue CSV-Datei schreiben
    combined_data.to_csv(output_file, index=False)

# Deliberately removing try/catch, because we want script to fail loudly if something goes wrong
def main(city_name):
    # Load raw data
    df = pd.read_csv(RAW_TSV, delimiter = '\t')

    # Filter just the selected city
    df = df[ df['standort'] == city_name]

    # Filter N/A
    df = df[ df['loess_vorhersage'].notna()]

        # # weekly average -- need a DatetimeIndex and resample using weekly frequency
        # df['date_index'] = pd.to_datetime(df['datum'])
        # df.set_index('date_index', inplace=True)
        # # 'W' means weekend (Sunday)
        # df['weekly_avg'] = df['viruslast'].resample('W').mean()

    # Scale: log10
    df['scaled'] = np.log10(df['loess_vorhersage'])

    # rename columns
    df = df.rename(columns={'datum': 'date', 'scaled': 'virusload_avg' })
    print(df)

    # Write data to a CSV file
    file_city_name = city_name.replace('ä', 'ae')
    file_city_name = file_city_name.replace('ö', 'oe')
    file_city_name = file_city_name.replace('ü', 'ue')
    file_city_name = file_city_name.replace('ß', 'ss')
    file_city_name = file_city_name.replace(' ', '_')
    file_city_name = file_city_name.replace('(', '')
    file_city_name = file_city_name.replace(')', '')
    file_city_name = file_city_name.replace('-', '_')
    file_city_name = file_city_name.lower()

    output_file = f'Abwasser/{file_city_name}_sewage_data.csv'

    df.to_csv(
        output_file,
        columns=['date', 'virusload_avg'],
        header=True,
        sep=',',
        encoding='utf-8',
        index=False,
        decimal='.'
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch and analyze virusload data from RKI website.")

    # Script now only handles one city at a time.
    parser.add_argument('-c', '--cityName', help="Name of the city for which to analyze virusload data.")
    args = parser.parse_args()
    main(args.cityName)

    # parser.add_argument('-a', '--allCities', help="If you want to parse only one city, set this to False and set city_nmame to the city you want to parse. If you want to parse all cities, set this to True.")
    # parser.add_argument('-g', '--germany', help="If you want the aggregated data for Germany, set this to True.")
    # main(args.cityName, args.allCities, args.germany)
