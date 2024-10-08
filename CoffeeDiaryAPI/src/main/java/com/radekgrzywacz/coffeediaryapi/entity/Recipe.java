package com.radekgrzywacz.coffeediaryapi.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String brewer;
    private String grinder;
    private int clicks;
    private int temperature;
    private int waterAmount;
    private int coffeeAmount;
    private int coffeeRatio;
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Step> steps = new ArrayList<>();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private AppUser user;

    @Override
    public String toString() {
        return "Recipe{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", brewer='" + brewer + '\'' +
                ", grinder='" + grinder + '\'' +
                ", clicks=" + clicks +
                ", temperature=" + temperature +
                ", waterAmount=" + waterAmount +
                ", coffeeAmount=" + coffeeAmount +
                ", coffeeRatio=" + coffeeRatio +
                ", steps=" + steps +
                ", userId=" + (user != null ? user.getId() : "null") +
                '}';
    }
}
