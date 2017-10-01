using System;
namespace HomeNinjaApp
{
    [AttributeUsage(AttributeTargets.Class)]
    public class ViewForFeatureAttribute : Attribute 
    {
        public ViewForFeatureAttribute(string[] features) {
            Features = features;
        }

        public string[] Features;
    }

    public interface INodeView
    {
        bool Test { get; set; }
    }
}
