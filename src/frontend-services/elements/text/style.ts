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
        }
        .text {
          display: block;
          flex-wrap: wrap;
          box-sizing: border-box;
          width: 100%;
          position: relative;
        }
       
        .animate.word{
          white-space: pre;
        }
        
        .animate .char{white-space: pre;}
        
        .char-internal {
          display: inline-flex;
        }

        .box {
          opacity: 0;
          transition: opacity .2s ease-in-out;
        }
        .box.active {
          opacity: 1;
        }
        
        .animate.word:not(.animated) .char-internal{
          opacity: 0;
          width: 0;
          height: 0;
          animation: letterAppear .1s ease-in-out var(--time);
          animation-fill-mode: both;
          animation-iteration-count: 1;
        }
        .word.animated .char-internal{
          opacity: 1; 
          width: auto;
          height: auto;
        }
        
        .text br {
          content: " ";
          width: 100%;
        }
      `
