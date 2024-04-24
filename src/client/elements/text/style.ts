export const elementStyle = `
        .container{
          display: flex;
          flex-direction: column;
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .box {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          max-width: 100%;
          max-height: 100%;
          overflow: hidden;
          opacity: 0;
          transition: opacity .2s ease-in-out;
        }
        .box.active {
          opacity: 1;
        }
        .text {
          display: block;
          flex-wrap: wrap;
          box-sizing: border-box;
          width: 100%;
          position: relative;
        }
        
        .char.animate {
          animation-fill-mode: both;
          animation-iteration-count: 1;
        }

        @keyframes charAppear {
          0%{
            opacity: 0;
          }
          100%{
            opacity: 1;
          }
        }
        
        .text br {
          content: " ";
          width: 100%;
        }
      `;

export function buildStateStyle(state: any): string {
  return `
  .container{
    align-items: ${state.boxAlignH};
    justify-content: ${state.boxAlignV};
  }
  .box{
    transform: translate3d(0,0,0);
    overflow-y: scroll;
    justify-content: start;
    width: ${state.boxAutoWidth ? 'auto' : '100%'};
    height: ${state.boxAutoHeight ? 'auto' : '100%'};
    box-shadow: ${state.boxShadowX}px ${state.boxShadowY}px ${state.boxShadowZ}px ${state.boxShadowSpread}px ${state.boxShadowColor};
    
    padding: ${state.boxScrollPaddingTop}px ${state.boxScrollPaddingRight}px ${state.boxScrollPaddingBottom}px ${state.boxScrollPaddingLeft}px;
    
    ${state.boxBackgroundType == "solid" ?
      `
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: ${state.boxColor};
    background-image: url("${window.ApiClient.files.getFileUrl(state.boxImageFileId)}");
    border-style: solid;
    border-radius: ${state.boxBorderRadius}px;
    border-width: ${state.boxBorderWidth}px;
    border-color: ${state.boxBorderColor};
    ` :
      `
    border-image: url(${window.ApiClient.files.getFileUrl(state.boxImageFileId)}) ${state.boxSliceTileSize} round;
    border-image-slice: ${state.boxSliceTop} ${state.boxSliceRight} ${state.boxSliceBottom} ${state.boxSliceBottom} fill;
    border-image-width: ${state.boxSliceTop}px ${state.boxSliceRight}px ${state.boxSliceBottom}px ${state.boxSliceBottom}px;
    `}
  }
  .box::-webkit-scrollbar {
    display: none;
  }

  .text-container{
    align-items: ${state.textAlignH};
    justify-content: ${state.textAlignV};
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    min-height: 100%;
    min-width: 100%;
  }

  .text{
    padding: ${state.boxPadding}px;
    font-family: ${state.textFontFamily};
    text-transform: ${state.textCase};
    text-align: ${state.textAlignH};
    font-size: ${state.textFontSize}px;
    font-weight: ${state.textFontWeight};
    line-height: ${state.textLineHeight};
    color: ${state.textColor};
    text-shadow: ${state.textShadowX}px ${state.textShadowY}px ${state.textShadowZ}px ${state.textShadowColor};
    
    -webkit-text-stroke: ${state.textStroke}px ${state.textStrokeColor};
    text-stroke: ${state.textStroke}px ${state.textStrokeColor};
  }
  .text img {
    height: ${state.textFontSize}px;
  }
  .profanity {
    color: ${state.textProfanityColor}
  }
  .interim {
    color: ${state.textColorInterim}
  }
  .interim.profanity {
    color: ${state.textProfanityInterimColor}
  }
  
  .char.animate {
    animation: charAppear ${state.animateDelayChar || 20}ms ease-in-out;
  }
  .scroll-container {
    transform: translate3d(0,0,0);
    min-height: 100%;
    min-width: 100%;
    max-height: 100%;
    overflow-y: scroll;
  }
  .scroll-container::-webkit-scrollbar {
    display: none;
  }
  `

}