using System;
using System.Collections.Generic;
//using HomeNinjaApp.Models;
using Xamarin.Forms;

namespace HomeNinjaApp.NodeViews
{
    [ViewForFeature(new[] { "brightness" })]
    public partial class Slider : ContentView, IExpandableNode
    {
        private Node itemNode { get; set; }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
            itemNode = BindingContext as Node;
        }

        async void Handle_ValueChanged(object sender, Xamarin.Forms.ValueChangedEventArgs e)
        {
            var newval = (int)this.slider.Value;
            await Helper.ServerHelper.Instance.SendIntStateAsync(itemNode, newval);
        }

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
