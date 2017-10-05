using System;
using System.Threading.Tasks;
using Plugin.Geolocator;
using Plugin.Geolocator.Abstractions;
using Xamarin.Forms;

namespace HomeNinjaApp.Helper
{
    public class LocationHelper
    {
        void Current_PositionChanged(object sender, PositionEventArgs e)
        {
            var newpos = e.Position;

            //ServerHelper.
        }

        public void StartLocationTracking() {
            var locator = CrossGeolocator.Current;

            CrossGeolocator.Current.PositionChanged += async (object sender, PositionEventArgs e) => {
                await ServerHelper.Instance.SendPosition(e.Position);
            };
        }

        private static LocationHelper _instance;
        public static LocationHelper Instance
        {
            get
            {
                return _instance ?? (_instance = new LocationHelper());
            }
        }
        

        public async Task<Position> GetCurrentLocation()
        {
            Position position = null;
            try
            {

                var locator = CrossGeolocator.Current;
                locator.DesiredAccuracy = 100;

                position = await locator.GetLastKnownPositionAsync();

                if (position != null)
                {
                    //got a cahched position, so let's use it.
                    return position;
                }



                position = await locator.GetPositionAsync(TimeSpan.FromSeconds(20), null, true);

            }
            catch (Exception ex)
            {
                //Display error as we have timed out or can't get location.
            }

            if (position == null)
                return position;

            var output = string.Format("Time: {0} \nLat: {1} \nLong: {2} \nAltitude: {3} \nAltitude Accuracy: {4} \nAccuracy: {5} \nHeading: {6} \nSpeed: {7}",
                position.Timestamp, position.Latitude, position.Longitude,
                position.Altitude, position.AltitudeAccuracy, position.Accuracy, position.Heading, position.Speed);
            return position;
            //Debug.WriteLine(output);
        }
    }
}

