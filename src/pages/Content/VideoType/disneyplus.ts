import { getItem } from '../modules/localStorage';
import { hiddenSubtitleCssInject } from '../modules/utils';



const run = async () => {
  let track = $('video').textTracks;
  console.log(track);
  window.requestAnimationFrame(run);
};
run();