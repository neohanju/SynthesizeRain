#target photoshop
//=============================================================================
// modify to the proper location
var strImageFolder = "D:/Workspace/Dataset/HJ_Rain/all";
var strResultFolder = "D:/Workspace/Dataset/HJ_Rain/result";
var nImageStart = 2001;
var nImageEnd = 2907;
var numRainImages = 20;
//=============================================================================

var gParamConfiguration = {
    GaussianBlur: {
        radius: {min: 0.4, max: 0.6, step: 0.1}
    },
    levelAdjust1: {
        start: {min: 100, max: 150, step: 10},
        end:   {min: 190, max: 230, step: 10}
    },
    motionBlur: {
        angle:    {min: 45, max: 135, step: 30},
        distance: {min: 30, max: 70,  step: 20}
    },
    levelAdjust2: {
        start: {min: 60,  max: 90,  step: 10},
        end:   {min: 170, max: 200, step: 10}
    }
}
//=============================================================================
for (var i = nImageStart; i <= nImageEnd; i++)
{
    var strImageName = "";
    var strImageNameCandidate = pad(i, 6, '0');
    var strImagePathCandidate = strImageFolder + "/" + strImageNameCandidate;
    var candidateExtensions = ['.jpg', '.jpeg', '.png'];    
    for (var j = 0; j < candidateExtensions.length; j++)
    {        
        var myfile = new File(strImagePathCandidate + candidateExtensions[j]);
        if (myfile.exists)
        {
            strImageName = strImageNameCandidate + candidateExtensions[j];            
            break;
        }
    }

    if ("" == strImageName)
    {
        alert("There is a no file with number " + i.toString());
        break;
    }
    generateRainImageSetFromSingleImage(strImageFolder, strImageName, numRainImages, strResultFolder);    
}

//=============================================================================






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
function adjustLevelValues(adj_input_start, adj_input_end) {
    // set values
    var idsetd = charIDToTypeID( "setd" );
        var desc4 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref2 = new ActionReference();
            var idAdjL = charIDToTypeID( "AdjL" );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref2.putEnumerated( idAdjL, idOrdn, idTrgt );
        desc4.putReference( idnull, ref2 );
        var idT = charIDToTypeID( "T   " );
            var desc5 = new ActionDescriptor();
            var idpresetKind = stringIDToTypeID( "presetKind" );
            var idpresetKindType = stringIDToTypeID( "presetKindType" );
            var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
            desc5.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
            var idAdjs = charIDToTypeID( "Adjs" );
                var list1 = new ActionList();
                    var desc6 = new ActionDescriptor();
                    var idChnl = charIDToTypeID( "Chnl" );
                        var ref3 = new ActionReference();
                        var idChnl = charIDToTypeID( "Chnl" );
                        var idChnl = charIDToTypeID( "Chnl" );
                        var idCmps = charIDToTypeID( "Cmps" );
                        ref3.putEnumerated( idChnl, idChnl, idCmps );
                    desc6.putReference( idChnl, ref3 );
                    var idInpt = charIDToTypeID( "Inpt" );
                        var list2 = new ActionList();
                        list2.putInteger( adj_input_start );     // Black point
                        list2.putInteger( adj_input_end );  // White point
                    desc6.putList( idInpt, list2 );
                    var idGmm = charIDToTypeID( "Gmm " );
                    desc6.putDouble( idGmm, 1.0 );  //Gamma point
                var idLvlA = charIDToTypeID( "LvlA" );
                list1.putObject( idLvlA, desc6 );
            desc5.putList( idAdjs, list1 );
        var idLvls = charIDToTypeID( "Lvls" );
        desc4.putObject( idT, idLvls, desc5 );
    executeAction( idsetd, desc4, DialogModes.NO );
};

//=============================================================================
function synthesizeRain(
    _gaussian_blur_radius,
    _adj1_input_start,
    _adj1_input_end,
    _motion_blur_angle,
    _motion_blur_distance,
    _adj2_input_start,
    _adj2_input_end)
{
    var docRef = app.activeDocument;

    // create black filled layer
    var blackColor = new SolidColor();
    blackColor.rgb.red = blackColor.rgb.green = blackColor.rgb.blue = 0;
    
    var rainLayerRef = docRef.artLayers.add();
    docRef.selection.selectAll();
    docRef.selection.fill(blackColor, ColorBlendMode.NORMAL, 100, false);
    docRef.selection.deselect();

    // add uniform noise
    rainLayerRef.applyAddNoise(150, NoiseDistribution.UNIFORM, true);

    // Gaussian blur
    var gaussian_blur_radius = _gaussian_blur_radius || 0.5;
    rainLayerRef.applyGaussianBlur(gaussian_blur_radius);

    //============================
    // LEVEL ADJUSTMENT
    //============================
    var adj1_input_start = 100 || _adj1_input_start;
    var adj1_input_end = 200 || _adj1_input_end;

    // create adjustment level layer (only Action Manager can create non text/normal layer)
    var idMk = charIDToTypeID( "Mk  " );
        var desc1 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref1 = new ActionReference();
            var idAdjL = charIDToTypeID( "AdjL" );
            ref1.putClass( idAdjL );
        desc1.putReference( idnull, ref1 );
        var idUsng = charIDToTypeID( "Usng" );
            var desc2 = new ActionDescriptor();
            var idGrup = charIDToTypeID( "Grup" );
            desc2.putBoolean( idGrup, true );
            var idType = charIDToTypeID( "Type" );
                var desc3 = new ActionDescriptor();
                var idpresetKind = stringIDToTypeID( "presetKind" );
                var idpresetKindType = stringIDToTypeID( "presetKindType" );
                var idpresetKindDefault = stringIDToTypeID( "presetKindDefault" );
                desc3.putEnumerated( idpresetKind, idpresetKindType, idpresetKindDefault );
            var idLvls = charIDToTypeID( "Lvls" );
            desc2.putObject( idType, idLvls, desc3 );
        var idAdjL = charIDToTypeID( "AdjL" );
        desc1.putObject( idUsng, idAdjL, desc2 );
    executeAction( idMk, desc1, DialogModes.NO );

    // adjust level value
    adjustLevelValues (adj1_input_start, adj1_input_end);

    // save the layer reference for return value
    var adjustLevelLayerRef = docRef.activeLayer;

    // motion blur
    var motion_blur_angle = _motion_blur_angle || 60;
    var motion_blur_distance = _motion_blur_distance || 50;
    if (motion_blur_angle > 90)
    {
        motion_blur_angle = motion_blur_angle - 180;
    }
    rainLayerRef.applyMotionBlur(motion_blur_angle, motion_blur_distance);

    // re-adjust level values
    var adj2_input_start = _adj2_input_start || 40;  // [40, 80]
    var adj2_input_end = _adj2_input_end || 150;  // [150, 200]
    adjustLevelValues (adj2_input_start, adj2_input_end);

    // blending with 'screen' mode
    rainLayerRef.blendMode = BlendMode.SCREEN;

    return {
        rainLayer: rainLayerRef, 
        adjustLevelLayer: adjustLevelLayerRef
    };
};

//=============================================================================
function generateRainImageSetFromSingleImage(_strImageFolder, _strImageName, _numVariations, _strResultFolder)
{
    var strImageNameParts = _strImageName.split(".");
    var strImagePath = _strImageFolder + "/" + _strImageName;
    
    var variationIndex = 0;
    var paramInfo = sampleParamValues(gParamConfiguration);

    // open file
    var fileRef = File(strImagePath);
    var docRef = app.open(fileRef);

    // duplicate background layer
    var duplicatedLayerRef = docRef.backgroundLayer.duplicate();

    // expand canvas
    var imageWidth  = docRef.width;
    var imageHeight = docRef.height;

    var canvasResizeWidth = 1.2 * imageWidth;
    var canvasResizeHeight = 1.2 * imageHeight;

    var listParamValueArray = [];    
    var pos = 0;
    for (var effKey in gParamConfiguration) 
    {        
        for (var valKey in gParamConfiguration[effKey]) 
        {
            listParamValueArray[pos] = paramInfo.sampledValues[effKey][valKey];            
            pos = pos + 1;
        }
    }    
    
    for (var variationIndex = 0; variationIndex < _numVariations; variationIndex++)
    {        
        // pick parameters
        var pos = 0;
        var params = {};
        for (var effKey in gParamConfiguration) 
        {
            params[effKey] = {};
            for (var valKey in gParamConfiguration[effKey]) 
            {
                listParamValueArray[pos] = shuffle(paramInfo.sampledValues[effKey][valKey]);
                params[effKey][valKey] = listParamValueArray[pos][0];
                pos = pos + 1;
            }
        }

        // expand canvas
        docRef.resizeCanvas(canvasResizeWidth, canvasResizeHeight, 
                                   AnchorPosition.MIDDLECENTER);

        // synthesize rain
        var resultLayers = synthesizeRain(
            params.GaussianBlur.radius,
            params.levelAdjust1.start,
            params.levelAdjust1.end,
            params.motionBlur.angle,
            params.motionBlur.distance,
            params.levelAdjust2.start,
            params.levelAdjust2.end
            );

        // crop
        docRef.crop(duplicatedLayerRef.bounds)

        // save result
        var strSaveName = strImageNameParts[0] + "_rain_" + pad(variationIndex, 4, '0') + ".jpg";
        var saveFileObject = {
            fileName:strSaveName,
            path:_strResultFolder,
            fileType:'jpg'
        };
        saveAsFileType(saveFileObject);        

        // remove layers
        resultLayers.adjustLevelLayer.remove();
        resultLayers.rainLayer.remove();
    };

    // close files
    docRef.close(SaveOptions.DONOTSAVECHANGES);
};

//=============================================================================
function sampleParamValues(_paramConfiguration) {
    var paramConfiguration = _paramConfiguration || gParamConfiguration;
    var samplingResult = {};
    var resultParamSet = [{}];
    var listIndices = [];    

    // random sampling
    for (var effKey in paramConfiguration) // key of effect
    { 
        samplingResult[effKey] = {};        

        for (var valKey in paramConfiguration[effKey]) // key of variable
        {
            samplingResult[effKey][valKey] = [];            
            
            for (var i = paramConfiguration[effKey][valKey].min;
                i < paramConfiguration[effKey][valKey].max;
                i = i + paramConfiguration[effKey][valKey].step) 
            {                
                samplingResult[effKey][valKey].push(
                    (i + Math.random() * paramConfiguration[effKey][valKey].step));                
            }

            // random shuffling
            samplingResult[effKey][valKey] = shuffle(samplingResult[effKey][valKey]);

            // for linked index
            parentIndex = null;
            if (0 < listIndices.length) {
                parentIndex = listIndices[listIndices.length - 1];
            }
            listIndices.push(
                new linkedIndex(samplingResult[effKey][valKey].length, parentIndex)
                );
        }
    }

    // TODO: random shuffling

    // // generate combinations
    // var combinationList = [new paramCombination(initialParamCombination.param)];
    // while (listIndices[listIndices.length-1].increase()) {
    //     var curIndex = listIndices[listIndices.length - 1];
    //     var resultIndicesList = curIndex.get();

    //     // pick the values
    //     var newCombination = new paramCombination(initialParamCombination.param);
    //     for (var effKey in paramConfiguration) 
    //     {
    //         for (var valKey in paramConfiguration[effKey]) 
    //         {
    //             newCombination.param[effKey][valKey] = 
    //                 samplingResult[effKey][valKey][resultIndicesList[curIndex.pos]];
    //             curIndex = curIndex.parent;
    //         }
    //     }
    //     combinationList.push(newCombination);
    // }

    return {sampledValues: samplingResult, linkedIndex: listIndices};
};

//=============================================================================
function linkedIndex(_size, _parent) 
{
    // member variables
    this.size = _size;
    this.parent = _parent || null;
    this.pos  = 0;

    // methods
    this.increase = function() 
    {
        this.pos = this.pos + 1;
        if (this.pos < this.size) { return true; }
        if (this.parent == null) { return false; }
        this.pos = 0;
        return this.parent.increase();
    };

    this.get = function() 
    {
        if (null == this.parent)
        {
            return [this.pos];
        }
        var resultList = this.parent.get();
        resultList.push(this.pos)
        return resultList;
    };
};

// //=============================================================================
// function paramCombination(_param)
// {
//     this.param = _param.constructor() || {};
    
//     for (var effKey in _param) 
//     {
//         for (var valKey in _param[effKey])
//         {
//             if (_param[effKey].hasOwnProperty(valKey)) 
//             {
//                 this.param[effKey][valKey] = _param[eff]
//             }
//         }        
//     }
//     return copy;
// };

//=============================================================================
function pad(_number, _width, _padingValue) {
    // ref: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
    z = _padingValue || '0';
    n = _number + '';
    return n.length >= _width ? n : new Array(_width - n.length + 1).join(z) + n;
}

//=============================================================================
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//()()
//('')HAANJU.YOO

