# preprocess_javascript
This is a location for javascript code used to acquire and format data for a SnowModel run

define_sm_inputs.js
You will need to be registered with a Google Earth Engine account to run these scripts. If you don't already have an account you can sign up for one here.

In GEE, in the left toolbar, select 'New' - 'File' from the red dropdown box. Enter a path, a filename, and a description.
In the code editor (upper center panel of GEE) paste the contents from the define_sm_inputs.js file provided here in Github. Click on 'Save'
Click on 'Run'. At this point you can explore the three tabs in the right toolbar (Inspecctor / Console / Tasks). Additionally, you will see data layers begin to appear in the bottom panel of GEE.
Choose 'Tasks'. You will see many image names with a blue 'run' button to the right of each. For each of these, you must click 'run'. This will bring up a dialog box asking if you want to initiate export. You can hit return and it will do so. Repeat this for all images.
Go to wherever you directed output (you have that option in the dialog box). Most commonly, this will be your Google Drive. You will find all exported geotiff images there.
