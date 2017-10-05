using System;
using System.Collections.Generic;

using Xamarin.Forms;

namespace HomeNinjaApp {

    public partial class MapPage : ContentPage
    {
        async void Handle_Clicked(object sender, System.EventArgs e)
        {
            var pos = await App.GetCurrentLocation();
            //Console.WriteLine(pos.Result?.Longitude.ToString());

            this.location.Text = pos.Longitude.ToString();
        }

        public MapPage()
        {
            InitializeComponent();
        }
    }
}
