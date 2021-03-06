﻿using System;
using System.Threading.Tasks;

using Xamarin.Forms;

namespace HomeNinjaApp
{
    public partial class App : Application
    {
        public static bool UseMockDataStore = false;
        public static string BackendUrl = "http://fw.knatofs.se:3000";



        public App()
        {
            InitializeComponent();



            if (UseMockDataStore)
                DependencyService.Register<MockDataStore>();
            else
                DependencyService.Register<CloudDataStore>();
            
            if (Device.RuntimePlatform == Device.iOS)
                MainPage = new MainPage();
            else
                MainPage = new NavigationPage(new MainPage());
            
            //pos.Result.Longitude
        }
    }
}
