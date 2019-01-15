import {Component} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {Meditasyon} from "../../entities/meditasyon";
import "rxjs/add/operator/map"
import {ListPage} from "../list/list";
import {VeritabaniProvider} from "../../providers/veritabani";
import {Storage} from "@ionic/storage";
import {AdMobFree, AdMobFreeBannerConfig} from "@ionic-native/admob-free";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  //ordan gelecek olan sayfamızı yaklamak için sayfa diye değişlen oluşturalım
  sayfa?:any;
  meditasyonlar:Meditasyon[];//bir meditasyon array i olusturmus olduk
  datalar:any=[];

    constructor(public navCtrl: NavController,
              private navParams:NavParams,
              private http:Http,
              private platform:Platform,
              private stroage:Storage,
              private veritabani: VeritabaniProvider,
                private admobFree:AdMobFree) {//params önceli sayufadan gelen parametreli almak için tanımladık

      this.stroage.get('tablohazir').then(veri=>{
          if(veri)
          {
             this.veritabani.veriTabaniDurumu().subscribe(hzr=>{
                 if(hzr){
                     //sayfa bosmu deilmi kontrolü yapalım şimdide
                     //baslangic sayfasında olup olmadıgımıza bakıyoruz?
                     if(this.sayfa !=null){
                         this.verileriListele(this.sayfa.kategori);
                     }else{
                         this.verileriListele("0");//tüm verileri listele
                     }
                 }
             })

          }
      });  //veri tabani kısmında veri tabanı haızrken stroagee olusturdugumuz kısmı cagırıp aldık
      this.sayfa=navParams.get('data');
      console.log('Yönlendirmeden Gelen Değer:',this.sayfa);
  }
  verileriListele(kategori){

        this.veritabani.tumDatayiGetir(kategori).then(cvp=>{
            this.datalar=cvp
        })



  }
  getMeditasyon():Observable<Meditasyon[]>{ //Oserable nedir? [] array döncek demek
   return this.http.get("http://www.mistikyol.com/mistikmobil/mobiljson.php")
                    .map(response=>response.json()) ; //daha sonra map ediyoruz ve gelen responsu karşılıyoruz ? map?

  }
   //Servise baglanıyoruz artık verilerimizi alabiliriz
   //ayrın bir metod olusturalım

   getDataFromWeb(){
     //metodumuza subscribe oluyoruz.Peki subscribe nedir?
     this.getMeditasyon().subscribe(p=>{
       this.meditasyonlar=p["meditasyonlar"];//bütün sayfayı p ye atadık aslında meditasyonlar array ini almıs olduk
      //bu değerleri sql lite a atalım
         this.veritabani.veriTabaniDurumu().subscribe(hzr =>{
            //hazır mi diye kontrol işlemi yapıyoruz
             //veri tabani hazirsa
             if(hzr){
                 for(var i=0;i<this.meditasyonlar.length;i++)
                 {
                     this.veritabani.veriEkle(this.meditasyonlar[i].baslik,this.meditasyonlar[i].aciklama,this.meditasyonlar[i].thumbnail,this.meditasyonlar[i].sesdosyasi,
                         this.meditasyonlar[i].tarih,this.meditasyonlar[i].kategori,this.meditasyonlar[i].id);

                 }
             }

         });

       console.log(this.meditasyonlar);

     })
  
   }
   ionViewDidLoad()//bu metod sayfa acılınca otomatik olarak devreye giren metod
   {
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
    this.getDataFromWeb();
    //providerları ayarlamamız gerekli
   }

   goMeditasyon(meditasyon)
   {
     this.navCtrl.push(ListPage,{
         meditasyon:meditasyon  //meditasyon olarak öbür sayfaya göndericez
     })
   }
}
