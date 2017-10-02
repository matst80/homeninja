using System;
using System.Collections.Generic;
//using HomeNinjaApp.Models;
using Xamarin.Forms;

namespace HomeNinjaApp.NodeViews
{
    [ViewForFeature(new[] { "Dimmable light" })]
    public partial class Slider : ContentView, IExpandableNode
    {
        public Slider()
        {
            InitializeComponent();
        }

        public bool Test { get; set; }

        public void Contract()
        {
            this.HeightRequest = this.MinimumHeightRequest;
        }

        public void Expand()
        {
            this.HeightRequest = 200;
            //throw new NotImplementedException();
        }
    }
}
