
MODULE Example
    
    PERS num counter := 20;
    PERS string myName := "example string";
    PERS bool isValid := TRUE;
    PERS bool isDO2 := TRUE;
    
    PROC main()
        
        WaitTime 1;
        Incr counter;
        !TPWrite ValToStr(counter);
        IF counter > 500 THEN
            counter := 0;
        ENDIF

        IF isValid = TRUE THEN
            Set Local_IO_0_DO1;
        ELSE
            Reset Local_IO_0_DO1;
        ENDIF

        IF isDO2 = TRUE THEN
            Set Local_IO_0_DO2;
        ELSE
            Reset Local_IO_0_DO2;
        ENDIF
        
    ENDPROC
    
ENDMODULE