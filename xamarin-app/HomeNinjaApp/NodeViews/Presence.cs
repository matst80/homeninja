using System;
using System.Collections.Generic;
using HomeNinjaApp.Helper;
using Xamarin.Forms;

namespace HomeNinjaApp.NodeViews
{
    [ViewForFeature(new []{"presence"})]
    public partial class Presence : ContentView, INodeView
    {
        

        public bool Test { get; set; }

       
        public Presence()
        {
            InitializeComponent();

        }

        private Node itemNode { get; set; }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
            itemNode = BindingContext as Node;
            var alive = itemNode?.State as bool?;
            if (alive!=null) {
                
            }
        }
    }
}
