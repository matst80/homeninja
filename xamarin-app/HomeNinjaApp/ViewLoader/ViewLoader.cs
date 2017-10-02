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
            View = new StackLayout() {
                Margin = new Thickness() {
                    Bottom = 2,
                    Left = 5,
                    Right = 5,
                    Top = 3,
                },
                BackgroundColor = Color.White
            };
            this.Tapped += (object sender, EventArgs e) => {
                Toggle();
            };
            //new NodeViews.OnOff();
            //Content = new Label { Text = "Hello ContentView" };

        }

        private View itemView { get; set; }

        public bool Expanded { get; set; }

        public async void Toggle() {
            if (CanExpand)
            {
                if (Expanded)
                {
                    Contract();
                }
                else
                {
                    Expand();
                }
            }
            else
            {
                await this.ParentView.Navigation.PushAsync(new ItemDetailPage(new ItemDetailViewModel(itemNode)));    
            }
        }

        public bool CanExpand {
            get {
                return itemView is IExpandableNode;
            }
        }

        public void Expand() {
            if (CanExpand)
            {
                var n = itemView as IExpandableNode;
                n.Expand();
                ForceUpdateSize();
                Expanded = true;
            }
        }

        public void Contract()
        {
            if (CanExpand)
            {
                var n = itemView as IExpandableNode;
                n.Contract();
                ForceUpdateSize();
                Expanded = false;
            }
        }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
            itemNode = BindingContext as Node;
            if (itemView==null) {
                var v = View as StackLayout;
                itemView = NodeViewHelper.Instance.GetViewForNode(itemNode) as View;
                v.Children.Add(itemView);
            }
           // 
            //v.Children.Clear();


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

