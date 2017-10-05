using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
//using uPLibrary.Networking.M2Mqtt.Messages;
using Xamarin.Forms;

namespace HomeNinjaApp
{
    public class ItemsViewModel : BaseViewModel
    {
        

        public ObservableCollection<Node> Items { get; set; }
        public Command LoadItemsCommand { get; set; }

        public ItemsViewModel()
        {
            Title = "Home ninja";
            Items = new ObservableCollection<Node>();
            LoadItemsCommand = new Command(async () => await ExecuteLoadItemsCommand());

            MessagingCenter.Subscribe<NewItemPage, Node>(this, "AddItem", async (obj, item) =>
            {
                var _item = item as Node;
                Items.Add(_item);
                await DataStore.AddItemAsync(_item);
            });

        }

        async Task ExecuteLoadItemsCommand()
        {
            if (IsBusy)
                return;

            IsBusy = true;

            Helper.LocationHelper.Instance.StartLocationTracking();

            var client = await Helper.ServerHelper.Instance.GetClient();
            client.MessageStream.Subscribe(msg=>{
                var messageString = System.Text.Encoding.UTF8.GetString(msg.Payload);
                var nodes = JsonConvert.DeserializeObject<IEnumerable<Node>>(messageString);
                foreach(var node in nodes) {
                    
                    Device.BeginInvokeOnMainThread(() =>{
                        var foundNode = Items.FirstOrDefault(d => d.Topic == node.Topic);
                        if (foundNode == null)
                        {
                            Items.Add(node);
                        }
                        else
                        {
                            foundNode.State = node.State;
                            foundNode.Text = node.Text;
                        }    
                    });


                }
            });
            await client.SubscribeAsync("homeninja/nodechange", System.Net.Mqtt.MqttQualityOfService.ExactlyOnce);

            try
            {
                Items.Clear();
                var items = await DataStore.GetItemsAsync(true);
                foreach (var item in items)
                {
                    Items.Add(item);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
