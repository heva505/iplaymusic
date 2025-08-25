import {
  IoIosKey,
  IoIosContact,
  IoIosFingerPrint,
  IoIosSearch,
  IoIosHeart,
  IoIosMicrophone,
  IoMdSettings,
  IoIosPulse,
  IoIosPlay,
} from "react-icons/io";
import { MdPause } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { HiSignal } from "react-icons/hi2";
import { IoMusicalNote } from "react-icons/io5";
import { GiSoundWaves } from "react-icons/gi";
import { MdWifiTethering, MdPlaylistPlay } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";
import { CgPlayTrackPrev, CgPlayTrackNext } from "react-icons/cg";

import { FaBackward, FaForward } from "react-icons/fa"; // rewind/forward
import { FiVolume2, FiVolumeX } from "react-icons/fi"; // volume/mute

const Icons = {
  key: IoIosKey,
  user: IoIosContact,
  fingerPrint: IoIosFingerPrint,
  signal: HiSignal,
  heart: IoIosHeart,
  note: IoMusicalNote,
  back: FaChevronLeft,
  forward: FaChevronRight,
  search: IoIosSearch,
  soundwaves: GiSoundWaves,
  microphone: IoIosMicrophone,
  settings: IoMdSettings,
  events: MdWifiTethering,
  playlist: MdPlaylistPlay,
  pulse: IoIosPulse,
  play: IoIosPlay,
  pause: MdPause,
  dots: BsThreeDots,
  prev: TbPlayerTrackPrevFilled,
  next: TbPlayerTrackNextFilled,
  skipb: CgPlayTrackPrev,
  skipf: CgPlayTrackNext,

  rewind: FaBackward,
  forward10: FaForward,
  volume: FiVolume2,
  volumeX: FiVolumeX,
};

export default Icons;
