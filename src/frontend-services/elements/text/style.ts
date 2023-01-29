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
