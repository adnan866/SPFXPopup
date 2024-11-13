import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import PopupSlider from './components/PopupSlider';
import { IPopupSliderProps } from './components/IPopupSliderProps';

export interface IPopupSliderWebPartProps {
  listName: string;
  maxPopupShows:number;
}

export default class PopupSliderWebPart extends BaseClientSideWebPart<IPopupSliderWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IPopupSliderProps> = React.createElement(
      PopupSlider,
      {
        listName: this.properties.listName,
        siteURL: this.context.pageContext.web.absoluteUrl,
        maxPopupShows:this.properties.maxPopupShows
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Popup Slider Configuration" },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('listName', { label: "SharePoint List Name" }),
                PropertyPaneSlider('maxPopupShows', {
                  label: "Maximum Popups per Day",
                  min: 1,
                  max: 10,
                  step: 1,
                  value: 1 // Default value
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
