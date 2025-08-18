<?php
namespace App\Services;

class Priorita {

    public const DISPONIBILE = "DISP";
    public const ALTA = "ALTA";
    public const MEDIA = "MEDIA";
    public const BASSA = "BASSA";

    public static function getValues($val = null){

        $priorita = [
            self::DISPONIBILE => "0",
            self::ALTA => "1",
            self::MEDIA => "2",
            self::BASSA => "3"
        ];
    
        if($val){
            return $priorita[$val];
        }

            return $priorita;
        
    }

}
