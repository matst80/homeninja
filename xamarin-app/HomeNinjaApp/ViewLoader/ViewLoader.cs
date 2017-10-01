using System;
using HomeNinjaApp.ViewModels;
using Xamarin.Forms;

namespace HomeNinjaApp.ViewLoader
{
    public class ViewLoader : ContentView
    {
        //LoaderViewModel viewModel;

        private Node itemNode { get; set; }

        public ViewLoader()
        {
            Content = new Label { Text = "Hello ContentView" };

        }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
            itemNode = BindingContext as Node;
            var lbl = Content as Label;
            lbl.Text = itemNode.Text;
        }
    }
}

