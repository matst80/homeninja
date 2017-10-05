using System;
using Newtonsoft.Json;
using Xamarin.Forms;

namespace HomeNinjaApp
{
    public partial class ItemDetailPage : ContentPage
    {
        public class Customize
        {
            [JsonProperty(PropertyName = "id")]
            public string Id { get; set; }
             [JsonProperty(PropertyName = "data")]
            public CustomizedItem Data { get; set; }
        }

        public class CustomizedItem {
            [JsonProperty(PropertyName = "name")]
            public string Text { get; set; }
            [JsonProperty(PropertyName = "icon")]
            public string Icon { get; set; }
        }

        async void Handle_TextChanged(object sender, Xamarin.Forms.TextChangedEventArgs e)
        {
            var newvalue = tbName.Text;
            viewModel.Item.Text = newvalue;
            var send = new Customize()
            {
                Id = viewModel.Item.Topic,
                Data = new CustomizedItem() {
                    Text = newvalue
                }
            };
            await Helper.ServerHelper.Instance.Post("/api/customization",send);
        }

        ItemDetailViewModel viewModel;

        // Note - The Xamarin.Forms Previewer requires a default, parameterless constructor to render a page.
        public ItemDetailPage()
        {
            InitializeComponent();

            var item = new Node
            {
                Text = "Item 1",
                Description = "This is an item description."
            };

            viewModel = new ItemDetailViewModel(item);
            BindingContext = viewModel;
        }

        public ItemDetailPage(ItemDetailViewModel viewModel)
        {
            InitializeComponent();

            BindingContext = this.viewModel = viewModel;
        }
    }
}
