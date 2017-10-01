using System;
using System.Collections.Generic;
//using HomeNinjaApp.Models;
using Xamarin.Forms;

namespace HomeNinjaApp.NodeViews
{
    [ViewForFeature(new[] { "Dimmable light" })]
    public partial class Slider : ContentView, INodeView
    {
        public Slider()
        {
            InitializeComponent();
        }

        public bool Test { get; set; }
    }
}
