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
            //this.ItemsListView.BorderStyle = BorderStyle.None;
            this.ItemsListView.ItemTemplate = new DataTemplate(typeof(HomeNinjaApp.ViewLoader.ViewLoader));

            //MyItems.
        }

         void OnItemSelected(object sender, SelectedItemChangedEventArgs args)
        {
            var item = args.SelectedItem as Node;
            if (item == null)
                return;
            

            //var v = this.ItemsListView.GetCell(args.SelectedItem) as ViewLoader;
            // Manually deselect item
            //v.Expand();
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
