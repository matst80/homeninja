using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Xamarin.Forms;

namespace HomeNinjaApp
{
    public partial class ItemsPage : ContentPage
    {
        ItemsViewModel viewModel;

        public ItemsPage()
        {
            InitializeComponent();

            BindingContext = viewModel = new ItemsViewModel();
        }

        async void OnItemSelected(object sender, SelectedItemChangedEventArgs args)
        {
            var item = args.SelectedItem as Node;
            if (item == null)
                return;
            var client = new HttpClient();
            client.BaseAddress = new Uri($"{App.BackendUrl}/");
            item.BoolState = !item.BoolState;
            var state = new SendState()
            {
                Topic = item.Topic+"/set",
                State = item.BoolState?"on":"off"
            };
            var serializedItem = JsonConvert.SerializeObject(state);
            var response = await client.PostAsync($"api/sendstate", new StringContent(serializedItem, System.Text.Encoding.UTF8, "application/json"));
            //await Navigation.PushAsync(new ItemDetailPage(new ItemDetailViewModel(item)));

            // Manually deselect item
            ItemsListView.SelectedItem = null;
        }

        async void AddItem_Clicked(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new NewItemPage());
        }

        protected override void OnAppearing()
        {
            base.OnAppearing();

            if (viewModel.Items.Count == 0)
                viewModel.LoadItemsCommand.Execute(null);
        }
    }
}
