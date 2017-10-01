using System;
using System.Collections.Generic;
//using HomeNinjaApp.Models;
using Xamarin.Forms;

namespace HomeNinjaApp.NodeViews
{
    [ViewForFeature(new[] { "temp" })]
    public partial class TempHum : ContentView, INodeView
    {
        private Node itemNode { get; set; }
        public bool Test { get; set; }

        public TempHum()
        {
            InitializeComponent();
        }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
            itemNode = BindingContext as Node;
        }
    }
}
