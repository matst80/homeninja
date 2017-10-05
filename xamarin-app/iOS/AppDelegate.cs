using System;
using System.Collections.Generic;
using System.Linq;

using Foundation;
using UIKit;

namespace HomeNinjaApp.iOS
{
    [Register("AppDelegate")]
    public partial class AppDelegate : global::Xamarin.Forms.Platform.iOS.FormsApplicationDelegate
    {

        //public static LocationManager Manager = null;

        public override bool FinishedLaunching(UIApplication app, NSDictionary options)
        {
            global::Xamarin.Forms.Forms.Init();
            LoadApplication(new App());


            //Manager = new LocationManager();
            //Manager.LocMgr.StartUpdatingLocation();

            return base.FinishedLaunching(app, options);
        }
    }
}
