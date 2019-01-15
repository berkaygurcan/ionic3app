import {Component} from '@angular/core';
import {NavController, NavParams, ToastController, Platform} from 'ionic-angular';
import {VeritabaniProvider} from "../../providers/veritabani";
import {AdMobFree, AdMobFreeBannerConfig} from "@ionic-native/admob-free";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  meditasyon: any ; //gelen meditasyonu gene burda meditasyona atayacagız
  data:any;

  sure:number;
  anlik:number;

  toplamSure:string="00:00";
  anlikSure:string="00:00";

  isPlay:boolean =false;//oynatildimi oynatilmadimi diye boolean deger olusturduk
  player=new Audio();//player olusturduk
  saniyeTimer:number=0;
  arttirmaSayisi:number;


  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private veritabani:VeritabaniProvider,
              private toastKontrol:ToastController,
              private admobFree:AdMobFree,
              private platform:Platform) {
    // If we navigated to this page, we will have an item available as a nav param
    this.meditasyon = navParams.get('meditasyon');//nav parametremiz ile  ne girdiysek gönderirken onu yazıp alacagız

    this.veritabani.veriTabaniDurumu().subscribe(hzr=>{
      if(hzr){
        this.meditasyonuGetir(this.meditasyon.sira);
      }
    })


  }
  meditasyonuGetir(sira){

    this.veritabani.birDataGetir(sira).then(cvp=>{
      this.data=cvp;
      console.log(cvp);
    })


  }
  favorilereEkle(sira){
    this.veritabani.favoriGuncelle(sira,"1");//ekle dedigimiz icin 1
    this.meditasyonuGetir(sira);
    this.toastYap("Favorilerinize Eklendi");
  }
  favorilerdenCikar(sira){
    this.veritabani.favoriGuncelle(sira,"0");//çıkarma dediğimiz icin 0
    this.meditasyonuGetir(sira);
    this.toastYap("Favorilerinizden Çıkarıldı");
  }
  //toast mesajlar icin fonk
  toastYap(msg){
    let toast=this.toastKontrol.create({
      //ayarları verelim
      message:msg,
      duration:2000,
      position:'top'
    });
    toast.present()//göster
  }

   ionViewDidLoad(){
     if(this.platform.is('cordova'))//cordova ise
     {
       const bannerConfig:AdMobFreeBannerConfig = {
         id:'ca-app-pub-2456343435454545/4256',
         isTesting:true,
         autoShow:true,

       }
       this.admobFree.banner.config(bannerConfig);//tanımladıgımız banner configi verdik
       this.admobFree.banner.prepare()
           .then(() =>{
             //reklam hazır
             console.log('reklam hazir');
           })
           .catch(hata => console.log(hata));
     }

     //providerları ayarlamamız gerekli
    this.player.src ="http://mistikyol.com/mistikmobil/audios/"+this.meditasyon.sesdosyasi;//böylece müzik playerimizi tanılamıs olduk


  }
  playPause()
  {
    if(this.isPlay){
      //muzik oynatiliyomu kontrolü
      this.player.pause();
      this.isPlay=false;

    }else{
      this.player.play();
      this.isPlay=true;


    }
    this.timerBaslat();//timer imizi baslattik
  //süreler için play tusuna bastıgımız anda işlerimizi yapalım
    if(this.player.readyState>0){//ready state nedir?
      this.sure=this.player.duration;//toplam süreyi aldık
      //bunu dakika saniye formatimna cevirmek icin fonk tanımladık
       this.toplamSure=this.formatTime(this.player.duration);
    }
  }
  formatTime(ms:number):string{

    let dakika:any=Math.floor(ms/60);
    let saniye:any=Math.floor(ms%60);

    if(dakika<10){
      dakika='0'+dakika;

    }
    if(saniye<10)
    {
      saniye='0'+saniye;
    }

    return dakika + ':'+saniye;
  }
  //şimdi anlık süreizi bulucaz bunun için bir timer ayarlicaz

  timerBaslat(){
    this.arttirmaSayisi = setInterval(()=>{
      this.anlikSureyiGetir()
    },1000)

  }

  anlikSureyiGetir(){
  this.anlik=this.player.currentTime;
  this.anlikSure=this.formatTime(this.player.currentTime);


  }

}
