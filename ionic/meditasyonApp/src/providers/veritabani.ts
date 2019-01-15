import {Injectable} from "@angular/core";
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {Platform} from "ionic-angular";
import {BehaviorSubject} from "rxjs";
import {Meditasyon} from "../entities/meditasyon";

@Injectable() //belirtmemiz gerekiyor. araştır?
export class VeritabaniProvider {
    private veritabani:SQLiteObject;
    private veritabaniHazir:BehaviorSubject<boolean>;//?
    ms:Meditasyon[];

    constructor(private storage:Storage,
                private sqlite:SQLite,
                private  platform:Platform){
        this.veritabaniHazir=new BehaviorSubject<boolean>(false);
        this.platform.ready().then(()=> {

            this.sqlite.create({
                name:'meditasyonVeritabani',
                location:'default'
            }).then((db:SQLiteObject) => {
                this.veritabani=db;
                this.storage.get('tablohazir').then(durum => {
                    if(durum){
                        this.veritabaniHazir.next(true);
                    }
                    else {//tablo veritabanımızda yok oluşturmalıyız.False dönerse
                        this.veritabani.executeSql('CREATE TABLE  veriler(id INTEGER PRIMARY KEY AUTOINCREMENT,baslik TEXT,aciklama TEXT,thumbnail TEXT UNIQUE ,sesdosyasi TEXT UNIQUE,favori INTEGER DEFAULT 0,tarih TEXT,kategori INTEGER DEFAULT  0,sira INTEGER DEFAULT 0)', [])
                            .then(() => console.log('Executed SQL'))
                            .catch(e => console.log(e));
                        this.veritabaniHazir.next(true);
                        this.storage.set('tablohazir',true);//tablo hazir oldugunu set ediyoruz

                    }
                })
            })

        }).catch(e => console.log(e));


    }
    //verileri eklemek için gerekli olan şeyleri yazalım
    veriEkle(baslik,aciklama,resim,ses,tarih,kategori,sira){
        //hemen datamızı oluşyuralım
        let data = [baslik,aciklama,resim,ses,tarih,kategori,sira];//let nedir?
        return this.veritabani.executeSql('INSERT  INTO  veriler(baslik,aciklama,thumbnail,sesdosyasi,tarih,kategori,sira) VALUES (?,?,?,?,?,?,?)',data)
            .then(res=>{
                console.log(res);
                return res;
            })
            .catch(e => console.log(e));//Sonuc döndürme ve yakalama yaptik

    }
    favoriGuncelle(id,durum){

        return this.veritabani.executeSql('UPDATE veriler SET  favori=? where  sira=?',[durum,id])//paramların icine soru işaretlerini sırayla gireriz
            .then(res=>{
                return res;
            })
            .catch(e => console.log(e));//Sonuc döndürme ve yakalama yaptik
    }

    tumDatayiGetir (kategori) {

        //sql querimizi olusturalım kategori sayfamıza göre gelsimn
        var query: string;
        if (kategori === "0") {
            query = "select * from veriler order by sira desc ";
        } else if (kategori === "00") {
            query = 'select * from veriler where favori = 1 order by sira desc';
        } else {
            query = "select * from veriler where kategori=" + kategori + "order by sira desc";
        }
        return this.veritabani.executeSql(query, []).then(res => {
            //gelen cevaba göre bir alcagımız datayı bir arraya e kaydedelim
            let data = [];
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    //yukardaki arrayimize push edicez neyi peki
                    //öncelikle obje olusturuyoruz bu array'imiz objeler döndürücek o objelerimizde baslik diye bölüm olusturduk
                    data.push({
                        baslik: res.rows.item(i).baslik,
                        aciklama: res.rows.item(i).aciklama,
                        thumbnail: res.rows.item(i).thumbnail,
                        sesdosyasi: res.rows.item(i).sesdosyasi,
                        favori: res.rows.item(i).favori,
                        tarih: res.rows.item(i).tarih,
                        kategori: res.rows.item(i).kategori,
                        sira: res.rows.item(i).sira
                    })//?


                }
            }
            return data;
        },hata=>{
            console.log('hata geldi',hata);
            return [];
        })
    }

    birDataGetir(sira){

        return this.veritabani.executeSql('SELECT  * FROM WHERE  sira = '+sira,[]).then(res => {
            let data = [];
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    //yukardaki arrayimize push edicez neyi peki
                    //öncelikle obje olusturuyoruz bu array'imiz objeler döndürücek o objelerimizde baslik diye bölüm olusturduk
                    data.push({
                        baslik: res.rows.item(i).baslik,
                        aciklama: res.rows.item(i).aciklama,
                        thumbnail: res.rows.item(i).thumbnail,
                        sesdosyasi: res.rows.item(i).sesdosyasi,
                        favori: res.rows.item(i).favori,
                        tarih: res.rows.item(i).tarih,
                        kategori: res.rows.item(i).kategori,
                        sira: res.rows.item(i).sira
                    })//?


                }
            }
            return data;
        }).catch(e => console.log(e));


    }

    veriTabaniDurumu(){

        return this.veritabaniHazir.asObservable();//verit abanı hazır mı değil mi görücez asObservable araştır
    }

}


