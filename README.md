### preprocess_javascript
---
---
#### This is a location for javascript code used to acquire and format data from Google Earth Engine for a SnowModel run.
---
---

**define_sm_inputs.js**

You will need to be registered with a Google Earth Engine account to run these scripts. If you don't already have an account you can sign up for one at the bottom of the page linked here:
[Google Earth Engine Signup](https://earthengine.google.com/) .

Once you've signed up for GEE, finde more information at the GEE developers website:
[Google Earth Engine Developers User Guide](https://developers.google.com/earth-engine/) .

Steps to Run this code:
* In GEE, in the left toolbar, select 'New' - 'File' from the red dropdown box. Enter a path, a filename, and a description.
* In the code editor (upper center panel of GEE) paste the contents from the *define_sm_inputs.js* file. Click 'Save'.
* Click on 'Run'. At this point you can explore the three tabs in the right toolbar (Inspecctor / Console / Tasks). Additionally, you will see data layers begin to appear in the bottom panel of GEE.
* Choose 'Tasks'. You will see many image names with a blue 'run' button to the right of each. For each of these, you must click 'run'. This will bring up a dialog box asking if you want to initiate export. You can hit return and it will do so. Repeat this for all images.
* Go to wherever you directed output (you have that option in the dialog box). Most commonly, this will be your Google Drive. You will find all exported geotiff images there.

Use the outputs of this workflow for the next step in preprocessing, found in the preprocess_matlab folder.
