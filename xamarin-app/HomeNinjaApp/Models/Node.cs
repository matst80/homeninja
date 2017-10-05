using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using Newtonsoft.Json;

namespace HomeNinjaApp
{

    public class TempHumState
    {
        //public string Id { get; set; }
        [JsonProperty(PropertyName = "temp")]
        public string Temperature { get; set; }

        [JsonProperty(PropertyName = "hum")]
        public float Humidity { get; set; }

    }
 
    public class Node : INotifyPropertyChanged
    {
        private string _text = "unnamed";

        [JsonProperty(PropertyName = "name")]
        public string Text { 
            get {
                return _text;
            }
            set
            {
                if (_text != value)
                {
                    _text = value;
                    OnPropertyChanged();
                }
            }
        }

        [JsonProperty(PropertyName = "desc")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "topic")]
        public string Topic { get; set; }

        [JsonProperty(PropertyName = "features")]
        public string[] Features { get; set; }

        [JsonProperty(PropertyName = "state")]
        public object State { get; set; }

        public bool BoolState { get; set; }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this,
                    new PropertyChangedEventArgs(propertyName));
            }
        }
    }
}
