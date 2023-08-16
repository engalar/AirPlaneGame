import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

interface IAudioMap {
    [name: string]: AudioClip;
}

@ccclass('audio_manager')
export class audio_manager extends Component {
    @property([AudioClip])
    public audioList: AudioClip[] = [];

    private m_dict: IAudioMap = {};
    private m_audio_source: AudioSource = null;

    start() {
        for(let i = 0; i < this.audioList.length; ++i){
            const audio_it = this.audioList[i];
            this.m_dict[audio_it.name] = audio_it;
        }
        this.m_audio_source = this.getComponent(AudioSource);
    }

    public play(name: string, vol = 1.0) {
        const audio_clip = this.m_dict[name];
        if(audio_clip === undefined) return;
        this.m_audio_source.playOneShot(this.m_dict[name]);
        this.m_audio_source.volume = vol;
    }

    update(deltaTime: number) {
        
    }
}


