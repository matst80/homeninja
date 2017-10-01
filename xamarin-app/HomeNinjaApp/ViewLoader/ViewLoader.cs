using System;
using System.Linq;
using HomeNinjaApp.ViewModels;
using Xamarin.Forms;

namespace HomeNinjaApp.ViewLoader
{
    public class ViewLoader : ViewCell
    {
        

        private Node itemNode { get; set; }

        public ViewLoader()
        {
            View = new StackLayout();
            //new NodeViews.OnOff();
            //Content = new Label { Text = "Hello ContentView" };

        }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
            var v = View as StackLayout;
            v.Children.Clear();
            itemNode = BindingContext as Node;
            v.Children.Add(NodeViewHelper.Instance.GetViewForNode(itemNode) as View);
            /*if (itemNode.Features.Any(d => d == "temp"))
                v.Children.Add(new NodeViews.TempHum());
            if (itemNode.Features.Any(d => d == "Dimmable light"))
                v.Children.Add(new NodeViews.Slider());
            else
                v.Children.Add(new NodeViews.OnOff());
            */
            //var lbl = Content as Label;
            //lbl.Text = itemNode.Text;
        }
    }
}

