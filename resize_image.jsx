#target photoshop
//=============================================================================
// modify to the proper location
var strImageFolder  = "D:/Workspace/Dataset/HJ_Rain/original";
var strResultFolder = "D:/Workspace/Dataset/HJ_Rain/synthesized";
var nImageStart = 0;
var nImageEnd   = 2907;
var MAX_WIDTH  = 3000;
var MAX_HEIGHT = 3000;
//=============================================================================

app.preferences.rulerUnits = Units.PIXELS;  // cm -> px

for (var i = nImageStart; i <= nImageEnd; i++)
{
	var strImageName = pad(i, 6, '0') + ".jpg";
	resizeImage(strImageName, MAX_WIDTH, MAX_HEIGHT);
}


//=============================================================================
function resizeImage(_strImageName, _maxWidth, _maxHeight) 
{
	var strImagePath  = strImageFolder + "/" + _strImageName;
	var strResultPath = strResultFolder + "/" + _strImageName;

	// open file
    var fileRef = File(strImagePath);
    var docRef = app.open(fileRef);

    // expand canvas
    var imageWidth  = docRef.width;
    var imageHeight = docRef.height;

    if (_maxWidth < imageWidth || _maxHeight < imageHeight)
    {
    	var resizeRatioWidth  = _maxWidth / imageWidth;
    	var resizeRatioHeight = _maxHeight / imageHeight;
    	var resizeRatio = Math.min(resizeRatioHeight, resizeRatioWidth);

    	docRef.resizeImage(Math.floor(imageWidth * resizeRatio));
    }

    // var strSaveFileName = "rs_" + _strImageName;
    var strSaveFileName = _strImageName;
    var saveFileObject = {
        fileName:strSaveFileName,
        path:strResultFolder,
        fileType:'jpg'
    };
    saveAsFileType(saveFileObject);
    docRef.close(SaveOptions.DONOTSAVECHANGES);
};

//=============================================================================
function saveAsFileType(fileObj) {	// { fileName, fileType, path, quality }	
	if (app.documents.length == 0) {
          alert("Please have an 'photoshop' document before running this script.");
          return;
    }
	var quality = fileObj.quality || 8, //default 3
		path = fileObj.path || app.activeDocument.path,	
		document = fileObj.document || app.activeDocument,
		fileName = fileObj.fileName || document.name,
		fileType = fileObj.fileType,
		path = fileObj.path;
	
	fileName = fileName.substr(0, fileName.lastIndexOf('.')); // remove file extension: x = x.replace(/\..+$/, '');
	var newFile = new File(path + "/" + fileName);
	
	switch(fileType.toLowerCase()) {
		case "jpg":		  
		case "jpeg":
			var saveOptions = new JPEGSaveOptions();
			saveOptions.embedColorProfile = true;
			saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
			saveOptions.matte = MatteType.NONE;
			saveOptions.quality = quality;
		  break;
		case "png":
			var saveOptions = new PNGSaveOptions();
			break;
		default:
		  var saveOptions = new PhotoshopSaveOptions();
			break;
	}
		
	document.saveAs(newFile, saveOptions, true, Extension.LOWERCASE);
};

//=============================================================================
function pad(_number, _width, _padingValue) {
    // ref: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
    z = _padingValue || '0';
    n = _number + '';
    return n.length >= _width ? n : new Array(_width - n.length + 1).join(z) + n;
}

//()()
//('') HAANJU.YOO
