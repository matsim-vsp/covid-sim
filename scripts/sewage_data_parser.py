import argparse
import json
import os
import shutil
from matplotlib import pyplot as plt
import pandas as pd
import requests
from bs4 import BeautifulSoup
from bs2json import BS2Json
import csv
# import pandas as pd
# import matplotlib.pyplot as plt

def fetch_data_from_website(url):
    # Send an HTTP request to the website
    response = requests.get(url)
    response.raise_for_status()  # Check for any HTTP errors
    return response.text

def parse_html(html_content):
    # Parse HTML content using BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    return soup

def find_matching_scripts(soup, text_to_find):
    # Find all <script> tags on the page
    script_tags = soup.find_all("script")

    # Search for the text "2022" in the <script> tags
    matching_scripts = [tag for tag in script_tags if text_to_find in tag.text]
    return matching_scripts

def convert_script_to_json(script):
    # Convert a <script> tag containing JSON data to a Python dictionary
    bs2json_converter = BS2Json(script)
    json_data = bs2json_converter.convert()["script"]["text"]
    return json.loads(json_data)

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

def write_data_to_csv(filename, fields, data, city_data):
    with open(filename, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(fields)

        for num in city_data:
            avg_date, avg_value, dot_value = "", "", ""

            if num in data[1]:
                index_avg = data[1].index(num)
                avg_date = data[0][index_avg]
                avg_value = data[2][index_avg]

                if num in data[4]:
                    index_dot = data[4].index(num)
                    dot_value = data[5][index_dot]

            if avg_date:
                writer.writerow([avg_date, avg_value, dot_value])

def write_complete_germany_data_to_csv(filename, fields, data):
    with open(filename, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(fields)

        for i in range(len(data[0])):

            date_avg = data[0][i]
            virusload_avg = data[2][i]
            virusload_dots = ""

            if date_avg in data[3]:
                index = data[3].index(date_avg)
                virusload_dots = data[5][index]

            writer.writerow([date_avg, virusload_avg, virusload_dots]) # date_values_avg, map_values_avg, virus_loads_avg, date_values_dots, map_values_dots, virus_loads_dots

def plot_data(data_frame):
    # Plot the data
    plt.figure(figsize=(12, 6))
    plt.plot(data_frame['date'], data_frame['virusload_avg'], color='black', label='virusload_avg')
    plt.scatter(data_frame['date'], data_frame['virusload'], color='gray', label='virusload', marker='o', alpha=0.5)

    # Format the x-axis date format
    plt.gca().xaxis.set_major_formatter(plt.matplotlib.dates.DateFormatter('%Y-%m-%d'))

    # Add labels and legend
    plt.xlabel('Date')
    plt.ylabel('Virusload')
    plt.title('Virusload Data')
    plt.legend()

    # Display the plot
    plt.grid(True)
    plt.tight_layout()
    plt.show()

def main(city_name, parse_all_cities, germany):
    # Define the URL of the website containing the data
    URL = 'https://www.rki.de/DE/Content/Institut/OrgEinheiten/Abt3/FG32/Abwassersurveillance/Bericht_Abwassersurveillance.html?__blob=publicationFile'

    # Define CSV file fields
    fields = ["date", "virusload_avg", "virusload"]

    try:
        # Fetch data from the website
        html_content = fetch_data_from_website(URL)

        # Parse HTML content
        soup = parse_html(html_content)

        # Search for scripts containing the desired data
        matching_scripts = find_matching_scripts(soup, '2022')

        # Convert scripts to JSON and extract data
        parsed_data = convert_script_to_json(matching_scripts[1 if germany else 3])
        date_values_avg, map_values_avg, virus_loads_avg = extract_plot_data(parsed_data, 4)
        date_values_dots, map_values_dots, virus_loads_dots = extract_plot_data(parsed_data, 2)

        os.makedirs("./Abwasser", exist_ok=True)
        if germany:
            write_complete_germany_data_to_csv('./Abwasser/complete_germany_sewage_data.csv', fields, [date_values_avg, map_values_avg, virus_loads_avg,
                                                                            date_values_dots, map_values_dots, virus_loads_dots])

        else:
            # Convert the second <script> tag containing city data
            json_data_city = convert_script_to_json(matching_scripts[2])
            

            if parse_all_cities:
                os.makedirs("./Abwasser/sewage", exist_ok=True)
                for city_name in json_data_city["map"]:
                    city_data = json_data_city["map"][city_name]
                    
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
                    write_data_to_csv(f'Abwasser/sewage/{file_city_name}_sewage_data.csv', fields, [date_values_avg, map_values_avg, virus_loads_avg,
                                                                            date_values_dots, map_values_dots, virus_loads_dots], city_data)
                    
                combine_csv_files("./Abwasser/sewage", "./Abwasser/sewage_combined_data.csv")    
                shutil.rmtree("./Abwasser/sewage")            
            elif city_name:
                city_data = json_data_city["map"][city_name]
                
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
                write_data_to_csv(f'Abwasser/{file_city_name}_sewage_data.csv', fields, [date_values_avg, map_values_avg, virus_loads_avg,
                                                                        date_values_dots, map_values_dots, virus_loads_dots], city_data)

        # Read the CSV file into a DataFrame
        # data_frame = pd.read_csv('/Users/friedrichvoelkers/GIT/covid-sim/Abwasser/sewage_combined_data.csv', parse_dates=['date'])

        # Plot the data
        # plot_data(data_frame)

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch and analyze virusload data from RKI website.")
    parser.add_argument('-c', '--cityName', help="Name of the city for which to analyze virusload data.")
    parser.add_argument('-a', '--allCities', help="If you want to parse only one city, set this to False and set city_nmame to the city you want to parse. If you want to parse all cities, set this to True.")
    parser.add_argument('-g', '--germany', help="If you want the aggregated data for Germany, set this to True.")
    args = parser.parse_args()
    main(args.cityName, args.allCities, args.germany)
