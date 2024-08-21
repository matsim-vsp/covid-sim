# get filename from command-line
args <- commandArgs(trailingOnly = TRUE)
if (length(args) != 3) {
  stop("Need three arguments\n\nUsage:\nRscript convert.R [population.xml.gz] [infectionEvents.txt] [EPSG code]\n\n")
}

library(xml2)
library(tibble)
library(readr)
library(purrr)
library(dplyr)
library(tidyr)
library(sf)
library(lubridate)

pop_filename <- args[1]
cat('\n',pop_filename,'\n')

# Read the .xml.gz file
gzipped_xml <- gzfile(pop_filename, "rb")
xml_data <- read_xml(gzipped_xml)
close(gzipped_xml)

infections_filename <- args[2]
cat('\n',infections_filename,'\n')
infections <- readr::read_tsv(infections_filename)

# --------------------
print("Calculate days since first infection")

first_date <- lubridate::ymd(infections[[1, "date"]])
difference <- interval(first_date, infections$date)
infections <- infections %>% mutate(daysSinceStart = as.integer(as.period(difference, unit="days")$day))

infections

# -------------------
print('Parsing XML')

# Find all nodes with a specific name
population <- xml_find_all(xml_data, "//population//person")


# -------------------
print('Converting attributes to tibble')
attributes <- population %>% xml_find_all("./attributes/attribute")

attrIds <- tibble(id = unlist(purrr::map(attributes, function(row) xml_attr(xml_parent(xml_parent(row)), "id"))))

personAttributes <- tibble(
  id = attrIds$id,
  name = attributes %>% xml_attr("name"),
  class = attributes %>% xml_attr("class"),
  value = attributes %>% xml_text(),
)

# which columns should be converted to numeric?
types <- personAttributes %>%
  select(name, class) %>%
  dplyr::distinct()

isDouble <- filter(types, class == "java.lang.Double")$name
isInteger <- filter(types, class == "java.lang.Integer")$name

# -------------------
# convert to a format we can join to the links
print('Converting to numeric values')
personAttributes <- (personAttributes
                   %>% select(-class)
                   %>% tidyr::pivot_wider(names_from = "name", values_from = "value")
                   %>% mutate_at(vars(one_of(isDouble)), as.double)
                   %>% mutate_at(vars(one_of(isInteger)), as.integer)
)

print('Join IDs to attributes')
pop_rows <- (tibble(id = population %>% xml_attr("id"))
             %>% left_join(personAttributes, by = "id")
)

print('Convert to long/lat')
pop_sf <- st_as_sf(pop_rows, coords=c("homeX","homeY"), crs=as.integer(args[3]))
pop_4326 <- st_transform(pop_sf, crs = 4326)
pop_4326_coords <- pop_4326 %>%
  st_coordinates() %>%
  as.data.frame()

names(pop_4326_coords) <- c("home_lon","home_lat")
pop_rows <- cbind(pop_rows, pop_4326_coords)
pop_rows <- pop_rows %>%
  mutate(home_lon=round(home_lon,7), home_lat=round(home_lat,7))

# -------------------
print('Writing population.csv')
readr::write_csv(pop_rows, "population.csv", quote="all")

# -----------------------------------------------------------
# Attach lon/lat to infection file, drop unused columns

infections <- (infections
               %>% left_join(pop_rows, by = c("infected" = "id"))
               %>% select(-infector, -facility, -probability, -homeId, -homeX, -homeY)
)

print('Writing infections.csv')
readr::write_csv(infections, "infections.csv", quote="all")


print('DONE')
