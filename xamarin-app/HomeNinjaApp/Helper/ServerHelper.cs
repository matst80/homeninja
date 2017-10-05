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

        public async System.Threading.Tasks.Task<HttpResponseMessage> Post(string url, object item)
        {
            var serializedItem = JsonConvert.SerializeObject(item);
            return await client.PostAsync(url, new StringContent(serializedItem, System.Text.Encoding.UTF8, "application/json"));

        }

        public async System.Threading.Tasks.Task SendBoolStateAsync(Node item, bool newstate)
        {

            item.BoolState = newstate;
            var state = new SendState()
            {
                Topic = item.Topic + "/set",
                State = item.BoolState ? "on" : "off"
            };

            await Post($"api/sendstate", state);

        }

        public async System.Threading.Tasks.Task SendIntStateAsync(Node item, int newstate)
        {

            item.BoolState = newstate>0;
            var state = new SendState()
            {
                Topic = item.Topic + "/set",
                State = newstate.ToString()
            };
            await Post($"api/sendstate", state);
        }

    }
}
