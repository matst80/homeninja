using System;

using Xamarin.Forms;

namespace HomeNinjaApp.ViewLoader
{
    public class ViewLoader : ContentView
    {
        public ViewLoader()
        {
            Content = new Label { Text = "Hello ContentView" };
        }
    }
}

