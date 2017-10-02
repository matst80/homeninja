using System;
using System.Collections.Generic;
using HomeNinjaApp.Helper;
using Xamarin.Forms;

namespace HomeNinjaApp.NodeViews
{
    [ViewForFeature(new []{"onoff"})]
    public partial class OnOff : ContentView, INodeView
    {
        private Node itemNode { get; set; }

        public bool Test { get; set; }

        async void HandleOn_Clicked(object sender, System.EventArgs e)
        {
            await Helper.ServerHelper.Instance.SendBoolStateAsync(itemNode,true);
        }

        async void HandleOff_Clicked(object sender, System.EventArgs e)
        {
            await Helper.ServerHelper.Instance.SendBoolStateAsync(itemNode, false);
        }

        public OnOff()
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
