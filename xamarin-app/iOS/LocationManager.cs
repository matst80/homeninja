using System;
using CoreLocation;
using UIKit;

namespace HomeNinjaApp.iOS
{
    public class LocationManager
    {
		protected CLLocationManager locMgr;

		public LocationManager()
		{
			this.locMgr = new CLLocationManager();
			this.locMgr.PausesLocationUpdatesAutomatically = false;

			// iOS 8 has additional permissions requirements
			if (UIDevice.CurrentDevice.CheckSystemVersion(8, 0))
			{
				locMgr.RequestAlwaysAuthorization(); // works in background
													 //locMgr.RequestWhenInUseAuthorization (); // only in foreground
			}

			if (UIDevice.CurrentDevice.CheckSystemVersion(9, 0))
			{
				locMgr.AllowsBackgroundLocationUpdates = true;
			}
		}

		public CLLocationManager LocMgr
		{
			get { return this.locMgr; }
		}
    }
}
