// JavaScript code for the Arduino Beacon example app.

// Application object.
var app = {}

// Flag determining if sink was visited before patient
//var mustWashFlag = false;

// Mapping of beacon names to page ids.
app.beaconPages =
{
	'B1':'page-sink',
	'B2':'page-patient'
}

// Signal strength of beacons.
app.beaconRSSI = {}

// Currently closest beacon.
app.currentBeacon = null

// Currently displayed page.
app.currentPage = 'page-default'

app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		app.onDeviceReady,
		false)
	app.gotoPage(app.currentPage)
}

app.onDeviceReady = function()
{
	// Cordova plugins are initialised, BLE is available.
	app.runClearBeaconTimer()
	app.startScan()
	app.runSelectPageTimer()
}

// Start scanning for beacons.
app.startScan = function()
{
	evothings.ble.startScan(
		app.deviceFound,
		app.scanError)
}

// Called when a device is found.
// @param deviceInfo - Object with fields: address, rssi, name
app.deviceFound = function(deviceInfo)
{
	// Note that RSSI value ranges from approx -127 to 0.
	// http://stackoverflow.com/questions/13705647/finding-distance-from-rssi-value-of-bluetooth-low-energy-enable-device
	// Sometimes the RSSI is 127, which is a buggy value
	// that we filter this out below.

	// Have we found one of our beacons?
	if (app.beaconPages[deviceInfo.name] && (deviceInfo.rssi < 0) && (deviceInfo.rssi > -55))
	{
		// Update signal strength for beacon.
		app.beaconRSSI[deviceInfo.name] =
		{
			rssi: deviceInfo.rssi,
			timestamp: Date.now()
		}
	}
}

// Called on scan error.
// @param errorCode - String
app.scanError = function(errorCode)
{
	// Report error.
	alert('Beacon Scan Error: ' + errorCode)
}

// Monitor beacons and display the page for the closest beacon.
app.runSelectPageTimer = function()
{
	// Find the closest beacon.
	var closestBeacon = null
	for (var beaconName in app.beaconRSSI)
	{
		if (!closestBeacon)
		{
			// First beacon found.
			closestBeacon = beaconName
			
			//If visiting patient before sink, set a flag to indicate
			//that hands must be washed.
			/*
			if (closestBeacon == 'B2')
			{
				mustWashFlag = true;
			}
			*/
			
		}
		else
		{
			var rssiBeacon = app.beaconRSSI[beaconName].rssi
			var rssiClosest = app.beaconRSSI[closestBeacon].rssi
			if (rssiBeacon > rssiClosest)
			{
				// Stronger beacon found.
				closestBeacon = beaconName
				
				// Reset flag indicating hands have been washed.
				/*
				if (closestBeacon == 'B1')
				{
					mustWashFlag = false;
				}
				*/
				
			}
		}
	}

	// Are we closer to a new beacon?
	if (app.currentBeacon != closestBeacon)
	{
		// Remember the current beacon.
		app.currentBeacon = closestBeacon

		// Get the page to display.
		var page = app.beaconPages[app.currentBeacon]
		if (!page) { page = 'page-default' }
		
		//Revert to default if too far away
		for (var allBeacons in app.beaconRSSI)
		{
			if (allBeacons.rssi < -50)
			{
				page = 'page-default'
			}
		}

		// Display the page.
		// If the wash flag is set (sink has not been visited before patient),
		// then only display the wash alert .
		/*
		if (mustWashFlag)
		{
			app.gotoPage('page-alert')
		}
		else
		{
			app.gotoPage(page)
		}
		*/
		app.gotoPage(page)
	}


	// Clear again after a time interval.
	setTimeout(function() { app.runSelectPageTimer() }, 300)
}

// Clear old beacon readings. This is done at a time interval
// to clear old beacon readings that may now be out of range.
app.runClearBeaconTimer = function()
{
	for (var beaconName in app.beaconRSSI)
	{
		var beaconInfo = app.beaconRSSI[beaconName]
		if (Date.now() - 10000 > beaconInfo.timestamp)
		{
			delete app.beaconRSSI[beaconName]
		}
	}

	// Clear again after a time interval.
	setTimeout(function() { app.runClearBeaconTimer() }, 300)
}

app.gotoPage = function(pageId)
{
	app.hidePage(app.currentPage)
	app.showPage(pageId)
	app.currentPage = pageId
}

app.showPage = function(pageId)
{
	document.getElementById(pageId).style.display = 'block'
}

app.hidePage = function(pageId)
{
	document.getElementById(pageId).style.display = 'none'
}

// Set up the application.
app.initialize()
