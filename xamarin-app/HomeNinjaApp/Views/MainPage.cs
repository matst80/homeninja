using System;

using Xamarin.Forms;

namespace HomeNinjaApp
{
    public class MainPage : TabbedPage
    {
        public MainPage()
        {
            Page itemsPage, mapPage = null;

            switch (Device.RuntimePlatform)
            {
                case Device.iOS:
                    itemsPage = new NavigationPage(new ItemsPage())
                    {
                        Title = "Browse"
                    };

                    mapPage = new NavigationPage(new MapPage())
                    {
                        Title = "Map"
                    };
                    itemsPage.Icon = "tab_feed.png";
                    mapPage.Icon = "tab_about.png";
                    break;
                default:
                    itemsPage = new ItemsPage()
                    {
                        Title = "Browse"
                    };

                    mapPage = new MapPage()
                    {
                        Title = "Map"
                    };
                    break;
            }

            Children.Add(itemsPage);
            Children.Add(mapPage);

            Title = Children[0].Title;
        }

        protected override void OnCurrentPageChanged()
        {
            base.OnCurrentPageChanged();
            Title = CurrentPage?.Title ?? string.Empty;
        }
    }
}
