import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class UsersModule { }


//TODO :
// - changer l'affichage des info (en liste, plus en calendrier)
// - gerer l'affichage de la page etablissement en fontion de la session si c;est super admin alors
// ce sont les etablissement sinon, ce sont les classes qui seront affichee dans la liste
// - details des etablissements a gerer aussi
// - service des etablissements a gerer
// - services des events(info) a gerer au plus vite aussi
// - page des messages a implementer
// - page du profil a implementer aussi au plus vite
// - resoudre le soucis de l'image qui ne s'affiche pas bien
// - resoudre aussi l'affichage du admin (a faire comme le user aussi).