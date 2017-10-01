using System;
using HomeNinjaApp.ViewModels;
using Xamarin.Forms;

namespace HomeNinjaApp.ViewLoader
{
    public class ViewLoader : ContentView
    {
        //LoaderViewModel viewModel;

        public Node ItemNode { get; set; }

        public ViewLoader()
        {
            Content = new Label { Text = "Hello ContentView" };
            //BindingContext = viewModel = new LoaderViewModel();
        }
    }
}

