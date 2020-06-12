// Script written by Ryan L. Crumley, July 2019
// Edited by DFH to add PRISM and fix NLCD, July 2019
// Edited by Nina to add SWR & LWR, Dec 2019
// Updated by Ryan, April 2020. Added multiband image export for PRISM, modified the resolution, changed some commenting, commented out some of the map visulizations.

 
// When using this script, simply copy and paste to your own GEE directory system.
// If you make changes, comment them out in a descriptive manner, and leave your name and date in the comment line.


////////////////////////////////////////////////////////////////////////
// This script will create all the required inputs for SnowModel, in geotiff format
// It can be used in conjunction with the Matlab script from D.Hill, July 2019

// OUTPUTS of this script: 
//      1) NLCD of the user-defined region, in geotiff
//      2) DEM of the user-defined region, in geotiff
//      3) Reanlaysis inputs for creating the MicroMet file, in geotiff format
//      4) PRISM climatologies of temp and precip (1 file per month)

// First, define a color scheme for the map visualization below.
var grnbrn = ['#543005','#8c510a','#bf812d','#dfc27d','#f6e8c3','#f5f5f5','#c7eae5','#80cdc1','#35978f','#01665e','#003c30'];
var visparams = {min:0,max:4000,palette:grnbrn};
var visparams_aster = {min:0,max:4000,bands:['elevation'],palette:grnbrn};

//////////////////////////////////////////////////////////////////////
////////////////   Variables requiring input   ///////////////////////
//////////////////////////////////////////////////////////////////////

// Create a domain name to attach to your output. Optional.
var domain_name = 'WY'

// These are the min and max corners of your domain in Lat, Long
// Western Wyoming
// Input the minimum lat, lower left corner
var minLat = 42.363116
// Input the minimum long, lower left corner
var minLong = -111.155208
// Input the max lat, upper right corner
var maxLat = 44.582480
// Input the max Long, upper right corner
var maxLong = -109.477849

// These are the min and max corners of your reanalysis in Lat, Long (create a slightly larger box)
// Input the minimum lat, lower left corner
var minLat2 = (minLat - 0.25);
// print(minLat2);
// Input the minimum long, lower left corner
var minLong2 = (minLong - 0.5);
// Input the max lat, upper right corner
var maxLat2 = (maxLat + 0.25);
// Input the max Long, upper right corner
var maxLong2 = (maxLong + 0.5);

// This resolution for the NLCD and DEM outputs for the SnowModel domain
// This is in meters
var sm_resolution = 100

// Resolution for the PRISM output. This shoud change by Latitude of the domain
// because the PRISM product spatial resolution is 2.5 minutes, which equals 150 arc seconds.
// You can use this arc-second calculator to estimate the correct value for the PRISM resolution by latitude
// https://opendem.info/arc2meters.html
// This is one arc-second in meters for 43 degrees N Latitude
var one_arcsecond = 22.57
var PRISM_resolution = (one_arcsecond * 150) 

// Define the final output projection using EPSG codes
// These are the EPSG codes for the final projection of your SnowModel simulation.
// WGS UTM Zone 12 Code for Idaho/Wyoming = 32612
// WGS UTM Zone 11 Code for Nevada        = 32611
// WGS UTM Zone 10 Code for West Coast    = 32610
// WGS 84 4326
// WGS UTM 10
// WGS Alaska Albers = 3338
var epsg_code = 'EPSG:32612';

// Name the DEM output
var dem_name = 'DEM';
// Name the Land Cover output
var lc_name = 'NLCD2016';

// The Beginning and End Dates you care about //
// This will start on the 'begin' date at 0:00 and the last iteration will be 
// on the day before the 'end' date below.
var begin = '2014-09-01';
var end = '2015-09-30';

//////////////////////////////////////////////////////////////////
/////////////////      DOMAIN     ////////////////////////////////
//////////////////////////////////////////////////////////////////

// Define the desired rectangular domain
// NOTE: The projection is not reset until the exporting process which also
// allows for it to be visualized as a layer.
var my_domain = ee.Geometry.Rectangle({
  coords:[minLong,minLat,maxLong,maxLat],
  proj: 'EPSG:4326',
  geodesic:true,
});

// This adds the domain you care about to the visualization in the GEE code editor.
Map.addLayer(my_domain,visparams,'My Domain');
print (my_domain);

// This adds the extent of the reanalysis product to the visualization the GEE code editor.
var my_domain2 = ee.Geometry.Rectangle([minLong2,minLat2,maxLong2,maxLat2]);//,'EPSG:32612',false);
Map.addLayer(my_domain2,visparams,'My Reanalysis Domain');
print (my_domain2);

// Check the domain area in meters squared. Uncomment using Command /.
//var my_domain_area = my_domain.area();
//print(my_domain_area);


////////////////   Datasets of Interest  //////////////////////
////////    Digital Elevation Models and Land Cover   /////////
///////////////////////////////////////////////////////////////

// NOTE: several choices below for DEM. Uncomment your preferred option

////////   Import 30m SRTM Data   ///////////////////
// NOTE: This only covers through 60 degrees latitude. See visualization layers.
//var SRTM30 = ee.Image('USGS/SRTMGL1_003');
// Find out some info about this image (hint: look in the console)
//var bands30 = SRTM30.bandNames();
//var info30 = SRTM30.getInfo();
//print(bands30,'Band Names');
//print(info30,'Band Info');
//Map.addLayer(SRTM30,visparams,'SRTM30');

////////  Import 100m ASTER data //////////////
// NOTE: this works above 60 deg lat; better for Alaska...
//var ASTER = ee.Image('NASA/ASTER_GED/AG100_003');
// Find out some info about this image (hint: look in the console)
//var bands100 = ASTER.bandNames();
//var info100 = ASTER.getInfo();
//print(bands100,'Band Names');
//print(info100,'Band Info');
//Map.addLayer(ASTER,visparams_aster,'ASTER');

/////////  Import 90m SRTM Data   ////////////////////
// NOTE: This only covers through 60 degrees latitude. See visualization layers.
var SRTM90 = ee.Image('CGIAR/SRTM90_V4');
var bands90 = SRTM90.bandNames();
var info90 = SRTM90.getInfo();
print(bands90,'Band Names');
print(info90,'Band Info');
//Map.addLayer(SRTM90,visparams,'SRTM90');

////////   Import NLCD Dataset   ////////////////////
var NLCD = ee.ImageCollection('USGS/NLCD');
//Note: the NLCD has numerous images for different years.
var landcover = NLCD.select('landcover');
// Define the timeframe of NLCD images to select. Currently, its set to the previous 5 years.
var landcoverfiltered=landcover.filterDate('2015-01-01','2020-01-01');
var landcoverVis = {
  min: 0.0,
  max: 95.0,
  palette: [
    '466b9f', 'd1def8', 'dec5c5', 'd99282', 'eb0000', 'ab0000', 'b3ac9f',
    '68ab5f', '1c5f2c', 'b5c58f', 'af963c', 'ccb879', 'dfdfc2', 'd1d182',
    'a3cc51', '82ba9e', 'dcd939', 'ab6c28', 'b8d9eb', '6c9fb8'
  ],
};
// Create a single image out of the image collection using the most common land cover 
// designation from the previous 5 years.
var lcsingle=landcoverfiltered.mode();
Map.addLayer(lcsingle, landcoverVis, 'Landcover');

////////////////   Datasets of Interest  //////////////////////
////////                PRISM DATA                    /////////
///////////////////////////////////////////////////////////////

//NOTE: these are 2.5 arc min. Roughly ~4 km. Seems to be the best option available...
//NOTE: you can pick any 30 year period you want. I chose 1985-2015.

/////////  Import PRISM Climatologies   ////////////////////
// Select precipitation by month and take the mean
var prism = ee.ImageCollection('OREGONSTATE/PRISM/AN81m');
var precipitation = prism.select('ppt');
var janppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(1,1,'month')).mean();
var febppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(2,2,'month')).mean();
var marppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(3,3,'month')).mean();
var aprppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(4,4,'month')).mean();
var mayppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(5,5,'month')).mean();
var junppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(6,6,'month')).mean();
var julppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(7,7,'month')).mean();
var augppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(8,8,'month')).mean();
var sepppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(9,9,'month')).mean();
var octppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(10,10,'month')).mean();
var novppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(11,11,'month')).mean();
var decppt = precipitation.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(12,12,'month')).mean();

// Create a multiband image for export
var prec = janppt.addBands(febppt).addBands(marppt).addBands(aprppt).addBands(mayppt).addBands(junppt).addBands(julppt).addBands(augppt).addBands(sepppt).addBands(octppt).addBands(novppt).addBands(decppt)
print(prec,'ppt')

// Uncomment using Command / for visualization
// var precipitationVis = {
//   min: 0.0,
//   max: 300.0,
//   palette: ['red', 'yellow', 'green', 'cyan', 'purple'],
// };
// Map.setCenter(-100.55, 40.71, 4);
// Map.addLayer(janppt, precipitationVis, 'Jan Precipitation');
// Map.addLayer(febppt, precipitationVis, 'Feb Precipitation');
// Map.addLayer(marppt, precipitationVis, 'Mar Precipitation');
// Map.addLayer(aprppt, precipitationVis, 'Apr Precipitation');
// Map.addLayer(mayppt, precipitationVis, 'May Precipitation');
// Map.addLayer(junppt, precipitationVis, 'Jun Precipitation');
// Map.addLayer(julppt, precipitationVis, 'Jul Precipitation');
// Map.addLayer(augppt, precipitationVis, 'Aug Precipitation');
// Map.addLayer(sepppt, precipitationVis, 'Sep Precipitation');
// Map.addLayer(octppt, precipitationVis, 'Oct Precipitation');
// Map.addLayer(novppt, precipitationVis, 'Nov Precipitation');
// Map.addLayer(decppt, precipitationVis, 'Dec Precipitation');

// Select temperature by month and take the mean
var tmean = prism.select('tmean');
var jantemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(1,1,'month')).mean();
var febtemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(2,2,'month')).mean();
var martemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(3,3,'month')).mean();
var aprtemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(4,4,'month')).mean();
var maytemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(5,5,'month')).mean();
var juntemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(6,6,'month')).mean();
var jultemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(7,7,'month')).mean();
var augtemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(8,8,'month')).mean();
var septemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(9,9,'month')).mean();
var octtemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(10,10,'month')).mean();
var novtemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(11,11,'month')).mean();
var dectemp = tmean.filter(ee.Filter.calendarRange(1985,2015,'year'))
.filter(ee.Filter.calendarRange(12,12,'month')).mean();

// Create a multiband image for export
var temp = jantemp.addBands(febtemp).addBands(martemp).addBands(aprtemp).addBands(maytemp).addBands(juntemp).addBands(jultemp).addBands(augtemp).addBands(septemp).addBands(octtemp).addBands(novtemp).addBands(dectemp);


// Uncomment using Command / for visualization
// var tmeanVis = {
//   min: -30.0,
//   max: 30.0,
//   palette: ['red', 'yellow', 'green', 'cyan', 'purple'],
// };
// Map.setCenter(-100.55, 40.71, 4);
// Map.addLayer(jantemp, tmeanVis, 'Jan Tmean');
// Map.addLayer(febtemp, tmeanVis, 'Feb Tmean');
// Map.addLayer(martemp, tmeanVis, 'Mar Tmean');
// Map.addLayer(aprtemp, tmeanVis, 'Apr Tmean');
// Map.addLayer(maytemp, tmeanVis, 'May Tmean');
// Map.addLayer(juntemp, tmeanVis, 'Jun Tmean');
// Map.addLayer(jultemp, tmeanVis, 'Jul Tmean');
// Map.addLayer(augtemp, tmeanVis, 'Aug Tmean');
// Map.addLayer(septemp, tmeanVis, 'Sep Tmean');
// Map.addLayer(octtemp, tmeanVis, 'Oct Tmean');
// Map.addLayer(novtemp, tmeanVis, 'Nov Tmean');
// Map.addLayer(dectemp, tmeanVis, 'Dec Tmean');


////////////////   Datasets of Interest  //////////////////////
////////                Reanalysis DATA               /////////
///////////////////////////////////////////////////////////////
var cfsv2 = ee.ImageCollection('NOAA/CFSV2/FOR6H')
                  .filter(ee.Filter.date(begin,end));
var tair = cfsv2.select('Temperature_height_above_ground').toBands();
var elev = cfsv2.select('Geopotential_height_surface').toBands();
var uwind = cfsv2.select('u-component_of_wind_height_above_ground').toBands();
var vwind = cfsv2.select('v-component_of_wind_height_above_ground').toBands();
var surfpres = cfsv2.select('Pressure_surface').toBands();
var spechum = cfsv2.select('Specific_humidity_height_above_ground').toBands();
var prec = cfsv2.select('Precipitation_rate_surface_6_Hour_Average').toBands();
var lwr = cfsv2.select('Downward_Long-Wave_Radp_Flux_surface_6_Hour_Average').toBands();
var swr = cfsv2.select('Downward_Short-Wave_Radiation_Flux_surface_6_Hour_Average').toBands();

// To check the time iterations, look at the printed variable in the console
print(tair, 'tair from CFSv2');

//////////////////////////////////////////////////////////////
///////   EXPORT, RESCALE, REPROJECT, CLIP  //////////////////
//////////////////////////////////////////////////////////////

// Export the SRTM DEM to Geotiff 
//Export.image.toDrive({
//  image: SRTM90,
//  description: dem_name+'_'+domain_name,
//  region: my_domain,
//  scale: my_resolution,
//  crs: epsg_code,
//  maxPixels: 1e12
//});

// Export the DEM to Geotiff 
Export.image.toDrive({
  image: SRTM90,
  description: dem_name+'_'+domain_name,
  region: my_domain,
  scale: sm_resolution,
  crs: epsg_code,
  maxPixels: 1e12
});

// Export the NLCD to Geotiff
Export.image.toDrive({
  image: lcsingle,
  description: lc_name+'_'+domain_name,
  region: my_domain,
  scale: sm_resolution,
  crs: epsg_code,
});

// Export the CFSv2 Temp to Geotiff 
Export.image.toDrive({
  image: tair,
  description: 'cfsv2_'+begin+'_'+end+'_tair',
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});


// Export the CFSv2 Elev to Geotiff 
Export.image.toDrive({
  image: elev,
  description: 'cfsv2_'+begin+'_'+end+'_elev',
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});

// Export the CFSv2 Prec to Geotiff 
Export.image.toDrive({
  image: prec,
  description: 'cfsv2_'+begin+'_'+end+'_prec' ,
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});

// Export the CFSv2 Uwind to Geotiff 
Export.image.toDrive({
  image: uwind,
  description: 'cfsv2_'+begin+'_'+end+'_uwind' ,
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});


// Export the CFSv2 Vwind to Geotiff 
Export.image.toDrive({
  image: vwind,
  description: 'cfsv2_'+begin+'_'+end+'_vwind' ,
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});

// Export the CFSv2 Surfpres to Geotiff 
Export.image.toDrive({
  image: surfpres,
  description: 'cfsv2_'+begin+'_'+end+'_surfpres' ,
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});

// Export the CFSv2 SpecHum to Geotiff 
Export.image.toDrive({
  image: spechum,
  description: 'cfsv2_'+begin+'_'+end+'_spechum' ,
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});

// Export the CFSv2 LWR to Geotiff 
Export.image.toDrive({
  image: lwr,
  description: 'cfsv2_'+begin+'_'+end+'_lwr' ,
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});

// Export the CFSv2 SWR to Geotiff 
Export.image.toDrive({
  image: swr,
  description: 'cfsv2_'+begin+'_'+end+'_swr' ,
  region: my_domain2,
  scale: 22200,
  crs: epsg_code,
});

////////////////////////////////////////////
///////// Prism Multiband Images ///////////
////////////////////////////////////////////

// Export the Prec to Geotiff
Export.image.toDrive({
  image: prec,
  description: 'PRISM_Precip',
  region: my_domain,
  scale: PRISM_resolution,
  crs: epsg_code,
});

// Export the Feb ppt to Geotiff
Export.image.toDrive({
  image: temp,
  description: 'PRISM_Temp',
  region: my_domain,
  scale: PRISM_resolution,
  crs: epsg_code,
});


///////////////////////////////////////////////////////////////
/////////////////  EXTRA STUFF ////////////////////////////////
///////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////
////////////     Import HUC Watersheds     ////////////////////
///////////////////////////////////////////////////////////////

// If you want to use the HUC watersheds, uncomment these lines with Command / .

// var HUC = ee.FeatureCollection('USGS/WBD/2017/HUC08');
// var styleParams = {
//   fillColor: 'ece7f2',
//   color: '000000',
//   width: 1.0,
// };
// var wsheds = HUC.style(styleParams);
// Map.addLayer(wsheds, {}, 'USGS/WBD/2017/HUC08');


//////////////////////////////////////////////////////////
/////////////   ASPECT/SLOPE/HILLSHADE  //////////////////
///////////////////////////////////////////////////////////////


// If you want to calculate aspect, slope, hillshade, uncomment these lines with Command / .
// 
// // This pre-cooked GEE function calculates slope in degrees (0-90) from the DEM layer.
// // It uses a 4 connected neighbors approach and edge pixels will have missing data.
// var slope = ee.Terrain.slope(DEM);
// Map.addLayer(slope,{},'Slope');
// 
// // This pre-cooked GEE function calculates aspect in degrees (0-365) from the DEM layer.
// // It uses a 4 connected neighbors approach and edge pixels will have missing data.
// var aspect = ee.Terrain.aspect(DEM);
// Map.addLayer(aspect,{},'Aspect');
// 
// // This pre-cooked GEE function creates a hillshade layer from the DEM.
// // This can come in handy when trying to recognize local geography and physical features.
// var hillshade = ee.Terrain.hillshade(DEM);
// Map.addLayer(hillshade,visHillshade,'Hillshade');
// 
// // This pre-cooked function allows all of the terrain products to be visualized in a single,
// // multi-band image. I like the red tinted visualization the best, with hillshade, slope, and
// // elevation data as the RGB layers. 
// var all = ee.Terrain.products(DEM);
// Map.addLayer(all,visProducts,'All Terrain Products');
// 
