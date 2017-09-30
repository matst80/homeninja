using System;

using Xamarin.Forms;

namespace HomeNinjaApp
{
    public partial class NewItemPage : ContentPage
    {
        public Node Item { get; set; }

        public NewItemPage()
        {
            InitializeComponent();

            Item = new Node
            {
                Text = "Item name",
                Description = "This is an item description."
            };

            BindingContext = this;
        }

        async void Save_Clicked(object sender, EventArgs e)
        {
            MessagingCenter.Send(this, "AddItem", Item);
            await Navigation.PopToRootAsync();
        }
    }
}
