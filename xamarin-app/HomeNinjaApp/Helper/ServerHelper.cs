using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Mqtt;
using System.Threading.Tasks;
//using System.Net.Mqtt;
using Newtonsoft.Json;
using Plugin.Geolocator.Abstractions;

namespace HomeNinjaApp.Helper
{
    

    public class ServerHelper
    {
        HttpClient client = new HttpClient();

        public ServerHelper()
        {
            client.BaseAddress = new Uri($"{App.BackendUrl}/");

        }

        internal async Task Send(string topic, object data) {
            var mclient = await GetClient();
            var nodedata = System.Text.Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data));
            await mclient.PublishAsync(new System.Net.Mqtt.MqttApplicationMessage(topic, nodedata), MqttQualityOfService.AtLeastOnce);
        }

        internal async Task SendPosition(Position position)
        {
            var node = new Node()
            {
                Text = "App position",
                Features = new string[] { "position" },
                State = position
            };
            var dataToSend = new List<Node>();
            dataToSend.Add(node);
            await Send("homeninja/nodeupdate", dataToSend);
        }

        private IMqttClient _mqttClient;

        public async Task<IMqttClient> GetClient() {
            if (_mqttClient == null)
            {
                _mqttClient = await System.Net.Mqtt.MqttClient.CreateAsync("fw.knatofs.se", new System.Net.Mqtt.MqttConfiguration()
                {
                    Port = 1884
                });
                await _mqttClient.ConnectAsync(new System.Net.Mqtt.MqttClientCredentials("homeninjaapp"));
            }
            return _mqttClient;
        }


        /*
        private object _mqttClient; 
        public System.Net.Mqtt.MqttClient MqttClient {
            get {
                return _mqttClient;
            }
        }
*/
        //public delegate void MqttMessage(object sender, MqttMessageEventArgs e);

        //public event MqttMessage MessageRecieved;



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
