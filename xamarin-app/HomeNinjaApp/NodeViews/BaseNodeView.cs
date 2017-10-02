using System;
using Xamarin.Forms;

namespace HomeNinjaApp.NodeViews
{
    public class BaseNodeView : ContentView
    {
        public BaseNodeView()
        {
            
        }

        internal Node itemNode { get; set; }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
            itemNode = BindingContext as Node;
        }
    }
}
