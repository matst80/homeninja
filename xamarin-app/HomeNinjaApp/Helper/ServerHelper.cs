using System;
using System.Net.Http;
using Newtonsoft.Json;

namespace HomeNinjaApp.Helper
{
    public class ServerHelper
    {
        HttpClient client = new HttpClient();

        public ServerHelper()
        {
            client.BaseAddress = new Uri($"{App.BackendUrl}/");
        }

        private static ServerHelper _instance;
        public static ServerHelper Instance {
            get{
                return _instance ?? (_instance = new ServerHelper());
            }
        }

        public async System.Threading.Tasks.Task SendBoolStateAsync(Node item, bool newstate)
        {

            item.BoolState = newstate;
            var state = new SendState()
            {
                Topic = item.Topic + "/set",
                State = item.BoolState ? "on" : "off"
            };
            var serializedItem = JsonConvert.SerializeObject(state);
            var response = await client.PostAsync($"api/sendstate", new StringContent(serializedItem, System.Text.Encoding.UTF8, "application/json"));
        }

        public async System.Threading.Tasks.Task SendIntStateAsync(Node item, int newstate)
        {

            item.BoolState = newstate>0;
            var state = new SendState()
            {
                Topic = item.Topic + "/set",
                State = newstate.ToString()
            };
            var serializedItem = JsonConvert.SerializeObject(state);
            var response = await client.PostAsync($"api/sendstate", new StringContent(serializedItem, System.Text.Encoding.UTF8, "application/json"));
        }

    }
}
